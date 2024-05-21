import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, Pipe, PipeTransform } from '@angular/core';
import { MatLegacySnackBar as MatSnackBar } from '@angular/material/legacy-snack-bar';
import { ActivatedRoute } from '@angular/router';
import {
  Statement,
  Income,
  Expense,
  Right,
  PricePerCurrency,
  Payment,
  mainCurrency,
  isDistributorStatement,
  getSources,
  sum,
  isSource,
  WaterfallSource,
  isProducerStatement,
  WaterfallContract,
  isDirectSalesStatement,
  getStatementRights,
  getCalculatedAmount,
  getStatementSources,
  getAssociatedRights,
  getStatementRightsToDisplay,
  generatePayments,
  getPathDetails,
} from '@blockframes/model';
import { unique } from '@blockframes/utils/helpers';
import { DashboardWaterfallShellComponent } from '@blockframes/waterfall/dashboard/shell/shell.component';
import { StatementService } from '@blockframes/waterfall/statement.service';
import { WaterfallState } from '@blockframes/waterfall/waterfall.service';
import { filter, firstValueFrom, pluck, switchMap, tap } from 'rxjs';

interface RightDetails {
  from: string,
  to: string,
  amount: number,
  taken: number,
  percent: number,
}

@Component({
  selector: 'crm-statement',
  templateUrl: './statement.component.html',
  styleUrls: ['./statement.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StatementComponent implements OnInit {
  public waterfall$ = this.shell.waterfall$;
  private waterfall = this.shell.waterfall;
  public incomes: Income[] = [];
  public sources: WaterfallSource[];
  public expenses: Expense[] = [];
  public rights: Right[] = [];
  public rightDetails: RightDetails[][] = [];
  private allRights: Right[];
  private contract: WaterfallContract;
  private simulation: WaterfallState;

  public statement$ = this.route.params.pipe(pluck('statementId')).pipe(
    switchMap((statementId: string) => this.statementService.valueChanges(statementId, { waterfallId: this.waterfall.id })),
    filter(statement => !!statement),
    tap(statement => {
      if (statement.versionId) {
        if (this.shell.setVersionId(statement.versionId)) this.versionChanged();
      }
    })
  );
  public statement: Statement;

  constructor(
    private shell: DashboardWaterfallShellComponent,
    private statementService: StatementService,
    private route: ActivatedRoute,
    private cdRef: ChangeDetectorRef,
    private snackBar: MatSnackBar,
  ) { }

  ngOnInit() { return this.versionChanged(); }

  public async versionChanged() {
    this.allRights = await this.shell.rights();
    const statement = await firstValueFrom(this.statement$);
    this.incomes = await this.shell.incomes(statement.incomeIds);

    if (isDistributorStatement(statement) || isProducerStatement(statement)) {
      const _contracts = await this.shell.contracts([statement.contractId]);
      this.contract = _contracts[0];
      if (!this.contract) {
        this.snackBar.open(`Contract "${statement.contractId}" not found in waterfall.`, 'close', { duration: 5000 });
        return;
      }
    }

    if (isDistributorStatement(statement) || isDirectSalesStatement(statement)) {
      this.expenses = await this.shell.expenses(statement.expenseIds);
    }

    this.shell.currentStatementId$.next(statement.id);
    this.shell.setDate(statement.duration.to);
    this.snackBar.open('Initializing waterfall... Please wait', 'close', { duration: 5000 });
    this.simulation = await this.shell.simulateWaterfall();
    this.snackBar.open('Waterfall initialized!', 'close', { duration: 5000 });

    this.sources = getStatementSources(statement, this.waterfall.sources, this.incomes, this.allRights, this.simulation.waterfall.state)

    if (isDistributorStatement(statement) || isDirectSalesStatement(statement)) {
      this.statement = statement;

      // Refresh waterfall if some incomes or expenses are not in the simulated waterfall
      const missingIncomeIds = this.statement.incomeIds.filter(i => !this.simulation.waterfall.state.incomes[i]);
      const missingExpenseIds = this.statement.expenseIds.filter(i => !this.simulation.waterfall.state.expenses[i]);
      if (missingIncomeIds.length || missingExpenseIds.length) {
        this.snackBar.open('Refreshing waterfall... Please wait', 'close', { duration: 5000 });
        const missingIncomes = this.incomes.filter(i => missingIncomeIds.includes(i.id));
        const missingExpenses = this.expenses.filter(e => missingExpenseIds.includes(e.id));

        this.simulation = await this.shell.appendToSimulation({
          incomes: missingIncomes.map(i => ({ ...i, status: 'received' })),
          expenses: missingExpenses.map(e => ({ ...e, status: 'received' })),
        });
        this.snackBar.open('Waterfall refreshed!', 'close', { duration: 5000 });
      }
    } else {
      this.statement = statement;
    }

    const rights = getStatementRights(this.statement, this.allRights);
    const rightIds = unique(this.sources.map(s => getAssociatedRights(s.id, rights, this.simulation.waterfall.state)).flat().map(r => r.id));
    this.rights = rights.filter(r => rightIds.includes(r.id));

    if (this.statement.status === 'draft') {
      // Reset payments
      if (isDistributorStatement(this.statement) || isDirectSalesStatement(this.statement)) {
        this.statement.payments.income = [];
      }
      this.statement.payments.right = [];
      delete this.statement.payments.rightholder;
    }

    this.statement = generatePayments(this.statement, this.simulation.waterfall.state, this.rights, this.incomes);

    this.cdRef.markForCheck();
  }

  public toPricePerCurrency(item: Income | Expense | Payment): PricePerCurrency {
    return { [item.currency]: item.price };
  }

  public getAssociatedSource(income: Income) {
    try {
      return this.waterfall.sources.find(s => s.id === income.sourceId).name;
    } catch (error) {
      if (this.snackBar._openedSnackBarRef === null) this.snackBar.open(error, 'close', { duration: 5000 });
    }
  }

  public getAssociatedSources(rightId: string) {
    return this.getAssociatedSourceIds(rightId)
      .map(s => this.waterfall.sources.find(source => source.id === s).name).join(' , ');
  }

  private getAssociatedSourceIds(rightId: string) {
    const rightSources = getSources(this.simulation.waterfall.state, rightId).map(i => i.id);
    return rightSources.filter(s => this.sources.map(s => s.id).includes(s));
  }

  public getRightPayment(rightId: string) {
    const payment = this.statement.payments.right.find(p => p.to === rightId);
    return payment ? this.toPricePerCurrency(payment) : { [mainCurrency]: 0 };
  }

  public getCalculatedAmount(rightId: string): PricePerCurrency {
    return { [mainCurrency]: getCalculatedAmount(rightId, this.statement.incomeIds, this.simulation.waterfall.state.transfers) };
  }

  public getCumulatedAmount(rightId: string, overrall = false): PricePerCurrency {
    if (overrall) {
      const currentCalculatedRevenue = this.simulation.waterfall.state.rights[rightId].revenu.calculated;
      return { [mainCurrency]: currentCalculatedRevenue };
    } else {
      // Get amount only for transfers to this right that are from the sames sources as the statement
      const transfers = Object.values(this.simulation.waterfall.state.transfers).filter(t => t.to === rightId);
      const sources = Object.values(this.simulation.waterfall.state.sources).filter(s => s.incomeIds.some(i => this.statement.incomeIds.includes(i)));
      const incomeIds = sources.map(s => s.incomeIds).flat();
      const history = transfers.map(t => t.history.filter(h => h.checked && incomeIds.includes(h.incomeId))).flat();
      const currentCalculatedRevenue = sum(history, i => i.amount * i.percent);
      return { [mainCurrency]: currentCalculatedRevenue };
    }
  }

  public showRightDetails({ id: rightId }: { id: string }) {
    const sources = this.getAssociatedSourceIds(rightId);

    this.rightDetails = sources.map(sourceId => {
      const details = getPathDetails(this.statement.incomeIds, rightId, sourceId, this.simulation.waterfall.state);
      return details.map(d => ({
        ...d,
        from: isSource(this.simulation.waterfall.state, d.from) ? this.waterfall.sources.find(s => s.id === d.from.id).name : this.allRights.find(r => r.id === d.from.id).name,
        to: this.allRights.find(r => r.id === d.to.id).name,
      }));
    });

    this.cdRef.markForCheck();
  }

}

@Pipe({ name: 'filterRights' })
export class FilterRightsPipe implements PipeTransform {
  transform(rights: Right[], statement: Statement) {
    return getStatementRightsToDisplay(statement, rights);
  }
}