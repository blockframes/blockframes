import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { InterestDetail } from '@blockframes/model';
import { DashboardWaterfallShellComponent } from '../../dashboard/shell/shell.component';

@Component({
  selector: 'waterfall-interest-table',
  templateUrl: './interest-table.component.html',
  styleUrls: ['./interest-table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class InterestTableComponent {
  @Input() interests: InterestDetail[] = [];
  public waterfall = this.shell.waterfall;

  constructor(private shell: DashboardWaterfallShellComponent) { }
}
