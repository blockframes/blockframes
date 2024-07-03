import { ChangeDetectionStrategy, Component } from '@angular/core';
import { DashboardWaterfallShellComponent } from '../../../dashboard/shell/shell.component';
import { combineLatest, map } from 'rxjs';

@Component({
  selector: 'waterfall-revenue-simulation-results',
  templateUrl: './revenue-simulation-results.component.html',
  styleUrls: ['./revenue-simulation-results.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WaterfallRevenueSimulationResultsComponent {
  public waterfall = this.shell.waterfall;
  private rightholders$ = combineLatest([this.shell.rightholderRights$, this.shell.rightholders$]).pipe(
    map(([rights, rightholders]) => rightholders.filter(r => rights.some(right => right.rightholderId === r.id)))
  );

  public results$ = combineLatest([this.shell.simulation$, this.rightholders$]).pipe(
    map(([state, rightholders]) => {
      return Object.values(state.waterfall.state.orgs)
        .filter(org => rightholders.some(r => r.id === org.id))
        .map(org => {
          const rightHolder = rightholders.find(r => r.id === org.id);
          return { name: rightHolder.name, revenue: org.revenu.calculated };
        })
    })
  );

  constructor(
    private shell: DashboardWaterfallShellComponent,
  ) { }

}

