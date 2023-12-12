
import { map, startWith } from 'rxjs';
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

import { DashboardWaterfallShellComponent } from '@blockframes/waterfall/dashboard/shell/shell.component';

import { Arrow } from '../layout';


@Component({
  selector: 'waterfall-graph-label',
  templateUrl: './label.component.html',
  styleUrls: ['./label.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WaterfallGraphLabelComponent {

  amount$ = this.shell.state$.pipe(
    map(state => Object.values(state.waterfall.state.transfers).find(t => t.from === this.arrow.parentId && t.to === this.arrow.childId)?.amount ?? 0),
    startWith(0),
  );
  @Input() arrow: Arrow;

  constructor(
    private shell: DashboardWaterfallShellComponent,
  ) { }
}