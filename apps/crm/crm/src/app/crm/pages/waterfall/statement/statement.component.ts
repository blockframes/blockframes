import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, Pipe, PipeTransform } from '@angular/core';
import { UntypedFormControl } from '@angular/forms';
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
  getNode,
  sum,
  isSource,
  isGroup,
  WaterfallSource,
  isProducerStatement,
  WaterfallContract,
  createRightPayment,
  createRightholderPayment,
  createIncomePayment,
  getPath,
  isDirectSalesStatement,
  pathExists,
  getStatementRights,
  getCalculatedAmount,
  getStatementSources,
  createIncome,
  getAssociatedRights,
  getStatementRightsToDisplay,
} from '@blockframes/model';
import { unique } from '@blockframes/utils/helpers';
import { DashboardWaterfallShellComponent } from '@blockframes/waterfall/dashboard/shell/shell.component';
import { StatementService } from '@blockframes/waterfall/statement.service';
import { WaterfallState } from '@blockframes/waterfall/waterfall.service';
import { where } from 'firebase/firestore';
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
  public currency = mainCurrency;
  public paymentDateControl = new UntypedFormControl();
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

  ngOnInit() { return this.switchToVersion(); }

  public async switchToVersion(_versionId?: string) {
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

      // Set default payment date to statement end date if no payment date is set
      this.paymentDateControl.setValue(statement.payments.rightholder?.date || statement.duration.to);
    }

    if (isDistributorStatement(statement) || isDirectSalesStatement(statement)) {
      const expenses = await this.expenseService.getValue([where('titleId', '==', this.waterfall.id)]);
      this.expenses = expenses.filter(e => statement.expenseIds.includes(e.id));
    }

    const versionId = _versionId || this.waterfall.versions[0]?.id;
    if (versionId) this.shell.setVersionId(versionId);
    this.shell.setDate(statement.duration.to);
    this.snackBar.open('Initializing waterfall... Please wait', 'close', { duration: 5000 });
    this.simulation = await this.shell.simulateWaterfall();
    this.snackBar.open('Waterfall initialized!', 'close', { duration: 5000 });

    this.sources = getStatementSources(statement, this.waterfall.sources, incomes, this.allRights, this.simulation.waterfall.state)

    if (isDistributorStatement(statement) || isDirectSalesStatement(statement)) {
      // Create missing incomes for the sources that are in the statement but do not have an income associated
      this.incomes = await this.addMissingIncomes(this.sources, incomes, statement, this.waterfall.sources);
      this.statement = statement;

      // Create income payments on the statement
      for (const income of this.incomes) {
        if (this.statement.payments.income.find(p => p.incomeId === income.id)) continue;
        this.statement.payments.income.push(createIncomePayment({
          id: this.statementService.createId(),
          incomeId: income.id,
          price: income.price,
          currency: income.currency,
          date: this.statement.duration.to,
        }));
      }

      // Refresh waterfall if some incomes or expenses are not in the simulated waterfall
      const missingIncomeIds = this.statement.incomeIds.filter(i => !this.simulation.waterfall.state.incomes[i]);
      const missingExpenseIds = this.statement.expenseIds.filter(i => !this.simulation.waterfall.state.expenses[i]);
      if (missingIncomeIds.length || missingExpenseIds.length) {
        this.snackBar.open('Refreshing waterfall... Please wait', 'close', { duration: 5000 });
        const missingIncomes = this.incomes.filter(i => missingIncomeIds.includes(i.id));
        const missingExpenses = this.expenses.filter(e => missingExpenseIds.includes(e.id));

        this.simulation = await this.shell.simulateWaterfall({
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
    this.rights = this.allRights.filter(r => rightIds.includes(r.id));

    this.generatePayments();

    this.cdRef.markForCheck();
  }

  private async addMissingIncomes(incomeSources: WaterfallSource[], incomeStatements: Income[], statement: Statement, waterfallSources: WaterfallSource[]) {
    let incomes: Income[] = [...incomeStatements];

    const sourcesWithoutIncome = incomeSources.filter(s => !incomeStatements.find(i => getAssociatedSource(i, waterfallSources).id === s.id));
    const missingIncomes: Income[] = [];
    for (const sourceWithoutIncome of sourcesWithoutIncome) {
      missingIncomes.push(createIncome({
        contractId: statement.contractId,
        price: 0,
        currency: mainCurrency,
        titleId: this.waterfall.id,
        date: statement.duration.to,
        sourceId: sourceWithoutIncome.id,
      }));
    }

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
      const sourceDetails: RightDetails[] = [];
      // Fetch incomes that are in the statement duration
      const incomeIds = this.simulation.waterfall.state.sources[sourceId].incomeIds.filter(i => this.statement.incomeIds.includes(i));

      const path = getPath(rightId, sourceId, this.simulation.waterfall.state);
      path.forEach((item, index) => {
        if (path[index + 1]) {
          const to = getNode(this.simulation.waterfall.state, path[index + 1]);
          const from = getNode(this.simulation.waterfall.state, item);
          const transfer = this.simulation.waterfall.state.transfers[`${from.id}->${to.id}`];
          let amount = 0;
          if (transfer) {
            const incomes = transfer.history.filter(h => incomeIds.includes(h.incomeId));
            amount = sum(incomes.filter(i => i.checked), i => i.amount);
          }

          let taken = 0;
          if (isGroup(this.simulation.waterfall.state, to)) {
            const innerTransfers = to.children.map(c => this.simulation.waterfall.state.transfers[`${to.id}->${c}`]).filter(t => !!t);
            const innerIncomes = innerTransfers.map(t => t.history.filter(h => incomeIds.includes(h.incomeId))).flat();
            taken = sum(innerIncomes.filter(i => i.checked), i => i.amount * i.percent);
          } else {
            taken = amount * to.percent;
          }

          const percent = isGroup(this.simulation.waterfall.state, to) && amount ? (taken / amount) : to.percent;

          sourceDetails.push({
            from: isSource(this.simulation.waterfall.state, from) ? this.waterfall.sources.find(s => s.id === from.id).name : this.allRights.find(r => r.id === from.id).name,
            to: this.allRights.find(r => r.id === to.id).name,
            amount,
            taken,
            percent: percent * 100,
          });
        }
      });

      return sourceDetails;
    });

    this.cdRef.markForCheck();
  }

  private generatePayments() {

    // Right Payments
    for (const right of this.rights) {
      const paymentExists = this.statement.payments.right.find(p => p.to === right.id);
      if (paymentExists) continue;

      const isInternal = right.rightholderId === this.statement.senderId;
      const amountPerIncome = this.statement.incomeIds.map(incomeId => ({ incomeId, amount: getCalculatedAmount(right.id, incomeId, this.simulation.waterfall.state.transfers) }));
      const payment = createRightPayment({
        id: this.statementService.createId(),
        to: right.id,
        price: sum(amountPerIncome, i => i.amount),
        currency: mainCurrency,
        date: isInternal ? this.statement.duration.to : undefined,
        incomeIds: amountPerIncome.map(i => i.incomeId),
        mode: isInternal ? 'internal' : 'external'
      });

      this.statement.payments.right.push(payment);
    }

    // Rightholder Payments
    if ((isDistributorStatement(this.statement) || isProducerStatement(this.statement)) && !this.statement.payments.rightholder) {
      const price = this.getRightholderPaymentPrice();
      const externalRights = this.rights.filter(r => r.rightholderId !== this.statement.senderId);

      // Sum of external right payments
      this.statement.payments.rightholder = createRightholderPayment({
        id: this.statementService.createId(),
        price: price,
        currency: mainCurrency,
        date: undefined,
        incomeIds: this.statement.incomeIds.filter(id => {
          const income = this.incomes.find(i => i.id === id);
          const source = getAssociatedSource(income, this.waterfall.sources);
          return income.price > 0 && externalRights.some(r => pathExists(r.id, source.id, this.simulation.waterfall.state));
        })
      });
    }

  }

  private getRightholderPaymentPrice() {
    if (isDistributorStatement(this.statement)) {
      // Total income received
      const incomes = this.statement.incomeIds.map(id => this.simulation.waterfall.state.incomes[id]);
      const incomeSum = sum(incomes, i => i.amount);
      // Total price of interal right payments
      const internalRightPaymentSum = sum(this.statement.payments.right.filter(r => r.mode === 'internal'), p => p.price);
      // What the rightholder did not take
      return incomeSum - internalRightPaymentSum;
    } else if (isProducerStatement(this.statement)) {
      // Total price of external right payments
      return sum(this.statement.payments.right.filter(r => r.mode === 'external'), p => p.price);
    }
  }

  public async reportStatement() {
    this.statement.status = 'reported';

    // Validate all internal "right" payments
    this.statement.payments.right = this.statement.payments.right.map(p => ({ ...p, status: p.mode === 'internal' ? 'received' : p.status }));
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

  public async markPaymentAsReceived(paymentDate: Date) {
    if (!isDistributorStatement(this.statement) && !isProducerStatement(this.statement)) return;
    this.statement.payments.rightholder.status = 'received';
    this.statement.payments.rightholder.date = paymentDate;

    // Validate all external "right" payments and set payment date
    this.statement.payments.right = this.statement.payments.right.map(p => ({
      ...p,
      status: p.mode === 'external' ? 'received' : p.status,
      date: p.mode === 'external' ? paymentDate : p.date
    }));

    await this.statementService.update(this.statement, { params: { waterfallId: this.waterfall.id } });

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