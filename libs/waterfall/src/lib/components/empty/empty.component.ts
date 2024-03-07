// Angular
import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { boolean } from '@blockframes/utils/decorators/decorators';
import { MatDialog } from '@angular/material/dialog';

// Blockframes
import { DashboardWaterfallShellComponent } from '../../dashboard/shell/shell.component';
import { VersionEditorComponent } from '../version/version-editor/version-editor.component';
import { WaterfallService } from '../../waterfall.service';
import { createModalData } from '@blockframes/ui/global-modal/global-modal.component';
import { createVersion, Version } from '@blockframes/model';

@Component({
  selector: 'waterfall-empty',
  templateUrl: './empty.component.html',
  styleUrls: ['./empty.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EmptyWaterfallComponent {

  @Input() @boolean showImportLinks = false;

  constructor(
    public shell: DashboardWaterfallShellComponent,
    private waterfallService: WaterfallService,
    private dialog: MatDialog,
  ) {
    this.shell.setDate(undefined);
  }

  public initWaterfall() {
    this.dialog.open(VersionEditorComponent, {
      data: createModalData({
        mode: 'init',
        isDefaultVersion: true,
        version: createVersion({ id: this.waterfallService.createId(), name: 'First version' }),
        rightholders: this.shell.waterfall.rightholders,
        onConfirm: async (_version: Version) => {
          const version = await this.waterfallService.addVersion(this.shell.waterfall, _version);

          this.shell.setVersionId(version.id);
          await this.shell.refreshWaterfall();
  
        }
      })
    });
  }
}
