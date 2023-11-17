import { Component, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { getAssociatedSource, getStatementSources, getTotalPerCurrency, sortByDate } from '@blockframes/model';

import { DynamicTitleService } from '@blockframes/utils/dynamic-title/dynamic-title.service';
import { DashboardWaterfallShellComponent } from '@blockframes/waterfall/dashboard/shell/shell.component';
import { combineLatest, map, pluck } from 'rxjs';

@Component({
  selector: 'waterfall-statement-view',
  templateUrl: './view.component.html',
  styleUrls: ['./view.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StatementViewComponent {

  public statement$ = combineLatest([this.route.params.pipe(pluck('statementId')), this.shell.statements$]).pipe(
    map(([statementId, statements]) => statements.find(s => s.id === statementId)),
    // tap(statement => this.shell.setDate(statement.duration.to)), TODO #9524 #9525 #9532 #9531 if state or simulation is needed here
  );

  private statementsHistory$ = combineLatest([this.statement$, this.shell.statements$]).pipe(
    map(([current, statements]) => statements.filter(s =>
      s.receiverId === current.receiverId &&
      s.senderId === current.senderId &&
      s.type === current.type &&
      ((!s.contractId && !current.contractId) || s.contractId === current.contractId)
    )),
    map(statements => sortByDate(statements, 'duration.to').reverse())
  );

  public sources$ = combineLatest([this.statement$, this.shell.incomes$]).pipe(
    map(([statement, incomes]) => getStatementSources(statement, this.waterfall.sources, incomes)),
  );

  // TODO #9524 for rights that have only one source
  public breakdown$ = combineLatest([this.sources$, this.shell.incomes$, this.statementsHistory$, this.statement$]).pipe(
    map(([sources, incomes, _history, current]) => {
      const indexOfCurrent = _history.findIndex(s => s.id === current.id);
      const previous = _history[indexOfCurrent + 1];
      const history = _history.slice(indexOfCurrent);

      return sources.map(source => {
        const currentSourcePayments = current.payments.income.filter(income => getAssociatedSource(incomes.find(i => i.id === income.incomeId), this.waterfall.sources).id === source.id);
        const previousSourcePayments = previous?.payments.income.filter(income => getAssociatedSource(incomes.find(i => i.id === income.incomeId), this.waterfall.sources).id === source.id);
        const cumulatedSourcePayments = history.map(s => s.payments.income).flat().filter(income => getAssociatedSource(incomes.find(i => i.id === income.incomeId), this.waterfall.sources).id === source.id);
        return {
          source,
          rows: [{
            section: 'Gross Receipts',
            previous: getTotalPerCurrency(previousSourcePayments),
            current: getTotalPerCurrency(currentSourcePayments),
            cumulated: getTotalPerCurrency(cumulatedSourcePayments)
          }]
        }
      });
    })
  );

  // TODO #9524 rights that have many sources have a dedicated breakdown
  public todo$;

  public waterfall = this.shell.waterfall;

  constructor(
    private shell: DashboardWaterfallShellComponent,
    private dynTitle: DynamicTitleService,
    private route: ActivatedRoute,
  ) {
    this.dynTitle.setPageTitle(this.shell.movie.title.international, 'View Statement');
  }

}