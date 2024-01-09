// Angular
import { Component, ChangeDetectionStrategy, OnInit, Output, EventEmitter } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';

import { createVersion, getDefaultVersionId, Version } from '@blockframes/model';
import { DashboardWaterfallShellComponent } from '../../dashboard/shell/shell.component';
import { createModalData } from '@blockframes/ui/global-modal/global-modal.component';
import { VersionEditorComponent } from '../version-editor/version-editor.component';
import { WaterfallService } from '../../waterfall.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'waterfall-version-selector',
  templateUrl: './version-selector.component.html',
  styleUrls: ['./version-selector.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VersionSelectorComponent implements OnInit {

  public waterfall$ = this.shell.waterfall$;
  public versionId: string;
  public lockedVersionId = this.shell.lockedVersionId;
  @Output() versionChanged = new EventEmitter<string>();

  constructor(
    private shell: DashboardWaterfallShellComponent,
    private snackbar: MatSnackBar,
    private waterfallService: WaterfallService,
    private dialog: MatDialog,
  ) { }

  ngOnInit() { this.switchToVersion(this.shell.lockedVersionId); }

  public switchToVersion(_versionId = this.shell.versionId$.value) {
    this.versionId = _versionId || getDefaultVersionId(this.shell.waterfall);
    if (!this.versionId) return;
    if (this.versionId === this.shell.versionId$.value) return;

    const versionName = this.shell.waterfall.versions.find(v => v.id === this.versionId)?.name;
    this.snackbar.open(`Switched to version "${versionName}"`, 'close', { duration: 5000 });
    this.shell.setVersionId(this.versionId);
    this.versionChanged.emit(this.versionId);
  }

  public edit(versionId: string) {
    const version = this.shell.waterfall.versions.find(v => v.id === versionId);

    this.dialog.open(VersionEditorComponent, {
      data: createModalData({
        mode: 'edit',
        version,
        rightholders: this.shell.waterfall.rightholders,
        onConfirm: async (version: Version, rightholderIds: string[] = []) => {
          const versions = this.shell.waterfall.versions.map(v => v.id === version.id ? version : v);
          if (version.default) versions.filter(v => v.id !== version.id).forEach(v => v.default = false);
          const rightholders = this.shell.waterfall.rightholders.map(r => rightholderIds.includes(r.id) ? { ...r, lockedVersionId: version.id } : r);
          await this.waterfallService.update(this.shell.waterfall.id, { id: this.shell.waterfall.id, versions, rightholders });
        }
      })
    });
  }

  public create() {
    this.dialog.open(VersionEditorComponent, {
      data: createModalData({
        mode: 'create',
        version: createVersion({ id: this.waterfallService.createId(), name: 'New version' }),
        rightholders: this.shell.waterfall.rightholders,
        onConfirm: async (_version: Version, rightholderIds: string[] = []) => {

          const version = _version.standalone ?
            await this.waterfallService.addVersion(this.shell.waterfall, _version) :
            await this.shell.duplicateVersion(this.versionId, _version);

          const rightholders = this.shell.waterfall.rightholders.map(r => rightholderIds.includes(r.id) ? { ...r, lockedVersionId: version.id } : r);
          await this.waterfallService.update(this.shell.waterfall.id, { id: this.shell.waterfall.id, rightholders });

        }
      })
    });
  }

  public init() {
    this.dialog.open(VersionEditorComponent, {
      data: createModalData({
        mode: 'init',
        version: createVersion({ id: this.waterfallService.createId(), name: 'First version' }),
        rightholders: this.shell.waterfall.rightholders,
        onConfirm: async (_version: Version, rightholderIds: string[] = []) => {
          const version = await this.waterfallService.addVersion(this.shell.waterfall, _version);
          const rightholders = this.shell.waterfall.rightholders.map(r => rightholderIds.includes(r.id) ? { ...r, lockedVersionId: version.id } : r);
          await this.waterfallService.update(this.shell.waterfall.id, { id: this.shell.waterfall.id, rightholders });

          this.switchToVersion(version.id);
          const canInitWaterfall = firstValueFrom(this.shell.canInitWaterfall$);
          if (canInitWaterfall) await this.shell.refreshWaterfall();
          this.versionId = version.id;
        }
      })
    });
  }
}
