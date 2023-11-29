// Angular
import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { boolean } from '@blockframes/utils/decorators/decorators';

// Blockframes
import { DashboardWaterfallShellComponent } from '../../dashboard/shell/shell.component';

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
  ) {
    this.shell.setDate(undefined);
  }
}
