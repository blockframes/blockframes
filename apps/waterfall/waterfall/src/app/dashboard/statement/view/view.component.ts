import { Component, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {
  RightPayment,
  getAssociatedSource,
  getOrderedRights,
  getSources,
  getStatementRightsToDisplay,
  getStatementSources,
  getTotalPerCurrency,
  sortByDate,
  toLabel
} from '@blockframes/model';
import { DynamicTitleService } from '@blockframes/utils/dynamic-title/dynamic-title.service';
import { DashboardWaterfallShellComponent } from '@blockframes/waterfall/dashboard/shell/shell.component';
import { combineLatest, map, pluck, tap } from 'rxjs';

@Component({
  selector: 'waterfall-statement-view',
  templateUrl: './view.component.html',
  styleUrls: ['./view.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StatementViewComponent {

  public statement$ = combineLatest([this.route.params.pipe(pluck('statementId')), this.shell.statements$]).pipe(
    map(([statementId, statements]) => statements.find(s => s.id === statementId)),
    tap(statement => this.shell.setDate(statement.duration.to)),
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

  public sourcesBreakdown$ = combineLatest([
    this.sources$, this.shell.incomes$, this.statementsHistory$,
    this.statement$, this.shell.rights$, this.shell.simulation$
  ]).pipe(
    map(([sources, incomes, _history, current, rights, simulation]) => {
      const indexOfCurrent = _history.findIndex(s => s.id === current.id);
      const previous = _history[indexOfCurrent + 1];
      const history = _history.slice(indexOfCurrent);

      const displayedRights = getStatementRightsToDisplay(current, rights);
      const orderedRights = getOrderedRights(displayedRights, simulation.waterfall.state);

      return sources.map(source => {
        const rows = [];

        // Incomes declared by statement.senderId
        const previousSourcePayments = previous?.payments.income.filter(income => getAssociatedSource(incomes.find(i => i.id === income.incomeId), this.waterfall.sources).id === source.id) || [];
        const currentSourcePayments = current.payments.income.filter(income => getAssociatedSource(incomes.find(i => i.id === income.incomeId), this.waterfall.sources).id === source.id);
        const cumulatedSourcePayments = history.map(s => s.payments.income).flat().filter(income => getAssociatedSource(incomes.find(i => i.id === income.incomeId), this.waterfall.sources).id === source.id);
        rows.push({
          section: 'Gross Receipts',
          previous: getTotalPerCurrency(previousSourcePayments),
          current: getTotalPerCurrency(currentSourcePayments),
          cumulated: getTotalPerCurrency(cumulatedSourcePayments)
        });

        const rights = orderedRights.filter(right => {
          const rightSources = getSources(simulation.waterfall.state, right.id);
          return rightSources.length === 1 && rightSources[0].id === source.id;
        });

        // What senderId took from source to pay his rights
        const previousSum: RightPayment[] = [];
        const currentSum: RightPayment[] = [];
        const cumulatedSum: RightPayment[] = [];
        for (const right of rights) {
          const section = right.type ? `${right.name} (${toLabel(right.type, 'rightTypes')} - ${right.percent}%)` : `${right.name} (${right.percent}%)`;
          const previousRightPayment = previous?.payments.right.filter(p => p.to === right.id) || [];
          previousSum.push(...previousRightPayment.map(r => ({ ...r, price: -r.price })));
          const currentRightPayment = current.payments.right.filter(p => p.to === right.id);
          currentSum.push(...currentRightPayment.map(r => ({ ...r, price: -r.price })));
          const cumulatedRightPayment = history.map(s => s.payments.right).flat().filter(p => p.to === right.id);
          cumulatedSum.push(...cumulatedRightPayment.map(r => ({ ...r, price: -r.price })));
          rows.push({
            section,
            type: 'right',
            previous: getTotalPerCurrency(previousRightPayment),
            current: getTotalPerCurrency(currentRightPayment),
            cumulated: getTotalPerCurrency(cumulatedRightPayment)
          });
        }

        // Net receipts
        const currentNet = getTotalPerCurrency([...currentSourcePayments, ...currentSum]);
        rows.push({
          section: `${source.name} (Net Receipts)`,
          type: 'net',
          previous: getTotalPerCurrency([...previousSourcePayments, ...previousSum]),
          current: currentNet,
          cumulated: getTotalPerCurrency([...cumulatedSourcePayments, ...cumulatedSum])
        });

        return { name: source.name, rows, net: currentNet };
      });
    })
  );

  public totalNetReceipt$ = this.sourcesBreakdown$.pipe(
    map(sources => sources.map(s => s.net).reduce((acc, curr) => {
      for (const currency of Object.keys(curr)) {
        acc[currency] = (acc[currency] || 0) + curr[currency];
      }
      return acc;
    })
    )
  );

  public rightsBreakdown$ = combineLatest([this.statementsHistory$, this.statement$, this.shell.rights$, this.shell.simulation$]).pipe(
    map(([_history, current, rights, simulation]) => {
      const indexOfCurrent = _history.findIndex(s => s.id === current.id);
      const previous = _history[indexOfCurrent + 1];
      const history = _history.slice(indexOfCurrent);

      const displayedRights = getStatementRightsToDisplay(current, rights);
      const orderedRights = getOrderedRights(displayedRights, simulation.waterfall.state);
      const rightsWithManySources = orderedRights.filter(right => getSources(simulation.waterfall.state, right.id).length > 1);

      return rightsWithManySources.map(right => {
        const name = right.type ? toLabel(right.type, 'rightTypes') : 'Unkown right type';
        const section = `${right.name} (${right.percent}%)`;
        const previousRightPayment = previous?.payments.right.filter(p => p.to === right.id) || [];
        const currentRightPayment = current.payments.right.filter(p => p.to === right.id);
        const cumulatedRightPayment = history.map(s => s.payments.right).flat().filter(p => p.to === right.id);
        return {
          name,
          row: {
            section,
            previous: getTotalPerCurrency(previousRightPayment),
            current: getTotalPerCurrency(currentRightPayment),
            cumulated: getTotalPerCurrency(cumulatedRightPayment)
          }
        };
      });
    })
  );

  private waterfall = this.shell.waterfall;

  constructor(
    private shell: DashboardWaterfallShellComponent,
    private dynTitle: DynamicTitleService,
    private route: ActivatedRoute,
  ) {
    this.dynTitle.setPageTitle(this.shell.movie.title.international, 'View Statement');
    this.shell.simulateWaterfall();
  }

}