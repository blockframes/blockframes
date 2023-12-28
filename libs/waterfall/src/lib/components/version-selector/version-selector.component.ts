// Angular
import { Component, ChangeDetectionStrategy, OnInit, Output, EventEmitter } from '@angular/core';

import { DashboardWaterfallShellComponent } from '@blockframes/waterfall/dashboard/shell/shell.component';

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

  constructor(private shell: DashboardWaterfallShellComponent) { }

  ngOnInit() { this.switchToVersion(this.shell.lockedVersionId); }

  public switchToVersion(_versionId = this.shell.versionId$.value) {
    this.versionId = _versionId || this.shell.waterfall.versions[0]?.id;
    if (!this.versionId) return;
    if (this.versionId === this.shell.versionId$.value) return;

    this.shell.setVersionId(this.versionId);
    this.versionChanged.emit(this.versionId);
  }
}
