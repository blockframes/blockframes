
import { map, startWith, switchMap } from 'rxjs';
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { DashboardWaterfallShellComponent } from '../../../dashboard/shell/shell.component';
import { Arrow } from '../layout';

@Component({
  selector: 'waterfall-graph-label',
  templateUrl: './label.component.html',
  styleUrls: ['./label.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WaterfallGraphLabelComponent {

  public amount$ = this.shell.stateMode$.pipe(
    switchMap(mode => mode === 'builder' ? this.shell.state$ : this.shell.simulation$),
    map(state => state.waterfall.state.transfers[`${this.arrow.parentId}->${this.arrow.childId}`]?.amount ?? 0),
    startWith(0),
  );
  public waterfall = this.shell.waterfall;
  @Input() arrow: Arrow;

  constructor(
    private shell: DashboardWaterfallShellComponent,
  ) { }
}