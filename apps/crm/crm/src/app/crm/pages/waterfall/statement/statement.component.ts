import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, Pipe, PipeTransform } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute } from '@angular/router';
import { ExpenseService } from '@blockframes/contract/expense/service';
import { IncomeService } from '@blockframes/contract/income/service';
import {
  Statement,
  Income,
  Expense,
  Right,
  PricePerCurrency,
  getAssociatedSource,
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
  createMissingIncomes,
  getPathDetails,
} from '@blockframes/model';
import { unique } from '@blockframes/utils/helpers';
import { DashboardWaterfallShellComponent } from '@blockframes/waterfall/dashboard/shell/shell.component';
import { StatementService } from '@blockframes/waterfall/statement.service';
import { WaterfallState } from '@blockframes/waterfall/waterfall.service';
import { combineLatest, filter, firstValueFrom, map, pluck } from 'rxjs';

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
  public reportDateControl = new FormControl<Date>(new Date());
  private allRights: Right[];
  private contract: WaterfallContract;

  private simulation: WaterfallState;
  public isRefreshing$ = this.shell.isRefreshing$;

  private statement$ = combineLatest([this.route.params.pipe(pluck('statementId')), this.shell.statements$]).pipe(
    map(([statementId, statements]) => statements.find(s => s.id === statementId)),
    filter(statement => !!statement),
  );
  public statement: Statement;

  constructor(
    private shell: DashboardWaterfallShellComponent,
    private statementService: StatementService,
    private incomeService: IncomeService,
    private expenseService: ExpenseService,
    private route: ActivatedRoute,
    private cdRef: ChangeDetectorRef,
    private snackBar: MatSnackBar,
  ) { }

  ngOnInit() { return this.versionChanged(); }

  public async versionChanged() {
    this.allRights = await this.shell.rights();
    const statement = await firstValueFrom(this.statement$);
    const incomes = await this.shell.incomes(statement.incomeIds);

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

    this.shell.setDate(statement.duration.to);
    this.snackBar.open('Initializing waterfall... Please wait', 'close', { duration: 5000 });
    this.simulation = await this.shell.simulateWaterfall();
    this.snackBar.open('Waterfall initialized!', 'close', { duration: 5000 });

    this.sources = getStatementSources(statement, this.waterfall.sources, incomes, this.allRights, this.simulation.waterfall.state)

    if (isDistributorStatement(statement) || isDirectSalesStatement(statement)) {
      // Create missing incomes for the sources that are in the statement but do not have an income associated
      this.incomes = await this.addMissingIncomes(this.sources, incomes, statement);
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
      this.incomes = incomes;
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

    this.statement = generatePayments(this.statement, this.simulation.waterfall.state, this.rights, this.incomes, this.waterfall.sources);

    this.cdRef.markForCheck();
  }

  private async addMissingIncomes(incomeSources: WaterfallSource[], incomeStatements: Income[], statement: Statement) {
    let incomes: Income[] = [...incomeStatements];

    const missingIncomes = createMissingIncomes(incomeSources, incomeStatements, statement, this.waterfall);

    if (missingIncomes.length) {
      const newIncomeIds = await this.incomeService.add(missingIncomes);
      const newIncomes = await this.incomeService.getValue(newIncomeIds);
      statement.incomeIds = [...statement.incomeIds, ...newIncomeIds];
      await this.statementService.update(statement, { params: { waterfallId: this.waterfall.id } });
      incomes = [...incomes, ...newIncomes];
    };

    return incomes;
  }

  public toPricePerCurrency(item: Income | Expense | Payment): PricePerCurrency {
    return { [item.currency]: item.price };
  }

  public getRightholderActual(type: 'revenu' | 'turnover') {
    const orgState = this.simulation?.waterfall.state.orgs[this.statement.senderId];
    const actual = orgState ? orgState[type].actual : 0;
    return { [mainCurrency]: actual };
  }

  public getAssociatedSource(income: Income) {
    try {
      return getAssociatedSource(income, this.waterfall.sources).name;
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

  public async reportStatement(reported: Date) {
    this.statement.status = 'reported';
    this.statement.reported = reported;

    // Add an id to the income payments if missing
    if (isDistributorStatement(this.statement) || isDirectSalesStatement(this.statement)) {
      this.statement.payments.income = this.statement.payments.income.map(p => ({ ...p, id: p.id || this.statementService.createId() }));
    }

    // Validate all internal "right" payments and add an id if missing
    this.statement.payments.right = this.statement.payments.right.map(p => ({
      ...p,
      status: p.mode === 'internal' ? 'received' : p.status,
      id: p.id || this.statementService.createId()
    }));

    // Add an id to the rightholder payment if missing
    if (isDistributorStatement(this.statement) || isProducerStatement(this.statement)) {
      this.statement.payments.rightholder.id = this.statement.payments.rightholder.id || this.statementService.createId();
    }

    const promises = [];
    promises.push(this.statementService.update(this.statement, { params: { waterfallId: this.waterfall.id } }));
    this.incomes = this.incomes.map(i => ({ ...i, status: 'received' }));
    promises.push(this.incomeService.update(this.incomes));
    this.expenses = this.expenses.map(e => ({ ...e, status: 'received' }));
    promises.push(this.expenseService.update(this.expenses));

    await Promise.all(promises);

    this.snackBar.open('Refreshing waterfall... Please wait', 'close', { duration: 5000 });
    await this.shell.refreshWaterfall();
    this.snackBar.open('Waterfall refreshed!', 'close', { duration: 5000 });
    this.cdRef.markForCheck();
  }

}

@Pipe({ name: 'filterRights' })
export class FilterRightsPipe implements PipeTransform {
  transform(rights: Right[], statement: Statement) {
    return getStatementRightsToDisplay(statement, rights);
  }
}