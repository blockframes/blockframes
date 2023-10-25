// Angular
import { Component, ChangeDetectionStrategy } from '@angular/core';
import { mainCurrency } from '@blockframes/model';

// Blockframes
import { DashboardWaterfallShellComponent } from '@blockframes/waterfall/dashboard/shell/shell.component';
import { map } from 'rxjs';

@Component({
  selector: 'waterfall-title-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardComponent {

  private currentRightholder = 'yi40WQqMrgBmbYl7p1mg' // TODO #9519 rf on wrong

  public incomes$ = this.shell.state$.pipe(
    map(state => {
      const incomeStates = Object.values(state.waterfall.state.incomes);
      if (!incomeStates.length) return { [mainCurrency]: 0 };
      const sum = incomeStates.map(a => a.amount).reduce((a, b) => a + b);
      return { [mainCurrency]: sum };
    })
  );

  private rightholderState$ = this.shell.state$.pipe(
    map(state => state.waterfall.state.orgs[this.currentRightholder])
  );

  public turnover$ = this.rightholderState$.pipe(
    map(state => ({ [mainCurrency]: state.turnover.actual }))
  );

  public revenue$ = this.rightholderState$.pipe(
    map(state => ({ [mainCurrency]: state.revenu.actual }))
  );

  constructor(
    private shell: DashboardWaterfallShellComponent,
  ) { }

}
