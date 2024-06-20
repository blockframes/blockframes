// Angular
import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { DashboardWaterfallShellComponent } from '../../../dashboard/shell/shell.component';

@Component({
  selector: 'waterfall-statement-participation',
  templateUrl: './statement-participation.component.html',
  styleUrls: ['./statement-participation.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StatementParticipationComponent {
  @Input() price: number;
  @Input() label = $localize`Producer's net participation`;
  public waterfall = this.shell.waterfall;

  constructor(private shell: DashboardWaterfallShellComponent) { }
}
