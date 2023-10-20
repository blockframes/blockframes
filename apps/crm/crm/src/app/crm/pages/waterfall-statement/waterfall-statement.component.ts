import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, Pipe, PipeTransform } from '@angular/core';
import { UntypedFormControl } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute } from '@angular/router';
import {
  Movie,
  Waterfall,
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
  movieCurrencies,
  WaterfallSource,
  isProducerStatement,
  WaterfallContract,
  createRightPayment,
  createRightholderPayment,
  createIncomePayment,
  getPath,
  isDirectSalesStatement,
  getStatementsHistory,
  RightType,
  pathExists
} from '@blockframes/model';
import { MovieService } from '@blockframes/movie/service';
import { unique } from '@blockframes/utils/helpers';
import { StatementService } from '@blockframes/waterfall/statement.service';
import { WaterfallService, WaterfallState } from '@blockframes/waterfall/waterfall.service';

interface RightDetails {
  from: string,
  to: string,
  amount: number,
  taken: number,
  percent: number,
}

@Component({
  selector: 'crm-waterfall-statement',
  templateUrl: './waterfall-statement.component.html',
  styleUrls: ['./waterfall-statement.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WaterfallStatementComponent implements OnInit {
  public movie: Movie;
  public waterfall: Waterfall;
  public statement: Statement;
  public incomes: Income[];
  public sources: WaterfallSource[];
  public expenses: Expense[];
  public rights: Right[];
  public rightDetails: RightDetails[][] = [];
  public currency = mainCurrency;
  public options = { xAxis: { categories: [] }, series: [] };
  public formatter = { formatter: (value: number) => `${value} ${movieCurrencies[mainCurrency]}` };
  public state: WaterfallState;
  public paymentDateControl = new UntypedFormControl();

  private allRights: Right[];
  private statements: Statement[];
  private contract: WaterfallContract;

  constructor(
    private movieService: MovieService,
    private waterfallService: WaterfallService,
    private statementService: StatementService,
    private route: ActivatedRoute,
    private cdRef: ChangeDetectorRef,
    private snackBar: MatSnackBar,
  ) { }

  ngOnInit() { return this.switchToVersion(); }

  public async switchToVersion(versionId?: string) {
    const waterfallId = this.route.snapshot.paramMap.get('waterfallId');
    const statementId = this.route.snapshot.paramMap.get('statementId');

    const data = await this.waterfallService.loadWaterfalldata(waterfallId);
    this.movie = await this.movieService.getValue(waterfallId);
    this.waterfall = data.waterfall;
    this.allRights = data.rights;
    this.statements = data.statements;
    this.statement = this.statements.find(s => s.id === statementId);

    if (isDistributorStatement(this.statement) || isProducerStatement(this.statement)) {
      const statement = this.statement;
      this.contract = data.contracts.find(c => c.id === statement.contractId);
      if (!this.contract) {
        this.snackBar.open(`Contract "${statement.contractId}" not found in waterfall.`, 'close', { duration: 5000 });
        return;
      }

      // Set default payment date to statement end date if no payment date is set
      this.paymentDateControl.setValue(this.statement.payments.rightholder?.date || this.statement.duration.to);
    }

    this.incomes = data.incomes.filter(i => this.statement.incomeIds.includes(i.id));
    this.sources = this.incomes.map(i => getAssociatedSource(i, this.waterfall.sources));

    if (isDistributorStatement(this.statement) || isDirectSalesStatement(this.statement)) {
      const statement = this.statement;
      this.expenses = data.expenses.filter(e => statement.expenseIds.includes(e.id));

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

    }

    if (!versionId && !this.waterfall.versions[0]?.id) { // Waterfall was never initialized
      await this.waterfallService.initWaterfall(this.waterfall.id, { id: 'version_1', description: 'Version 1' });
    }

    await this.buildWaterfallState(versionId || this.waterfall.versions[0].id);

    if (this.statement.incomeIds.some(i => !this.state.waterfall.state.incomes[i])) { // Some incomes are not in the waterfall
      await this.waterfallService.refreshWaterfall(this.waterfall.id, this.state.version.id);
      await this.buildWaterfallState(this.state.version.id);
    }

    this.buildGraph();

    const rightIds = unique(this.sources.map(s => this.getAssociatedRights(s.id)).flat().map(r => r.id));
    this.rights = this.allRights.filter(r => rightIds.includes(r.id));

    this.generatePayments();

    this.cdRef.markForCheck();
  }

  private async buildWaterfallState(versionId: string) {
    this.snackBar.open('Waterfall is loading. Please wait', 'close', { duration: 5000 });
    this.state = await this.waterfallService.buildWaterfall({
      waterfallId: this.waterfall.id,
      versionId,
      date: this.statement.duration.to
    });
    this.snackBar.open('Waterfall loaded !', 'close', { duration: 5000 });
  }

  public isDistributorStatement() {
    return isDistributorStatement(this.statement);
  }

  public toPricePerCurrency(item: Income | Expense | Payment): PricePerCurrency {
    return { [item.currency]: item.price };
  }

  public getRightholderName(id: string) {
    if (!id) return '--';
    return this.waterfall.rightholders.find(r => r.id === id)?.name || '--';
  }

  public getRightholderActual(type: 'revenu' | 'turnover') {
    const orgState = this.state.waterfall.state.orgs[this.statement.rightholderId];
    const actual = orgState ? orgState[type].actual : 0;
    return { [mainCurrency]: actual };
  }

  public getContractId() {
    return isDistributorStatement(this.statement) || isProducerStatement(this.statement) ? this.contract.id : '--';
  }

  public getRightholderPayment() {
    return isDistributorStatement(this.statement) || isProducerStatement(this.statement) ? this.statement.payments.rightholder : undefined;
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
    const rightSources = getSources(this.state.waterfall.state, rightId).map(i => i.id);
    return rightSources.filter(s => this.sources.map(s => s.id).includes(s));
  }

  private getAssociatedRights(sourceId: string) {
    const rightsFromSource: Right[] = [];
    // Groups are skipped here and revenue will be re-calculated from the childrens
    const groupRightTypes: RightType[] = ['horizontal', 'vertical'];
    const rights = this.allRights.filter(r => !groupRightTypes.includes(r.type));

    let rightholderRights: Right[] = []
    if (isDistributorStatement(this.statement)) {
      const otherParty = this.contract.sellerId === this.statement.rightholderId ? this.contract.buyerId : this.contract.sellerId;
      rightholderRights = rights.filter(r => otherParty === r.rightholderId || r.contractId === this.contract.id);
    } else if (isProducerStatement(this.statement)) {
      rightholderRights = rights.filter(r => r.contractId === this.contract.id && r.rightholderId !== this.statement.rightholderId);
    } else if (isDirectSalesStatement(this.statement)) {
      rightholderRights = rights.filter(r => r.rightholderId === this.statement.rightholderId);
    }

    if (!this.state.waterfall.state.sources[sourceId]) {
      this.snackBar.open(`Source "${sourceId}" not found in waterfall.`, 'close', { duration: 5000 });
      console.log(`Source "${sourceId}" not found in waterfall. Check incomes and statement dates.`);
      return [];
    }

    for (const right of rightholderRights) {
      const sources = getSources(this.state.waterfall.state, right.id);
      if (sources.find(s => s.id === sourceId)) rightsFromSource.push(right);
    }

    return rightsFromSource;
  }

  public getRightPayment(rightId: string) {
    const payment = this.statement.payments.right.find(p => p.to === rightId);
    return payment ? this.toPricePerCurrency(payment) : { [mainCurrency]: 0 };
  }

  public getCalculatedAmount(rightId: string): PricePerCurrency {
    const transfers = Object.values(this.state.waterfall.state.transfers).filter(t => t.to === rightId);
    const history = transfers.map(t => t.history.filter(h => h.checked && this.statement.incomeIds.includes(h.incomeId))).flat();
    const currentCalculatedRevenue = sum(history, i => i.amount * i.percent);
    return { [mainCurrency]: currentCalculatedRevenue };
  }

  public getCumulatedAmount(rightId: string, overrall = false): PricePerCurrency {
    if (overrall) {
      const currentCalculatedRevenue = this.state.waterfall.state.rights[rightId].revenu.calculated;
      return { [mainCurrency]: currentCalculatedRevenue };
    } else {
      // Get amount only for transfers to this right that are from the sames sources as the statement
      const transfers = Object.values(this.state.waterfall.state.transfers).filter(t => t.to === rightId);
      const sources = Object.values(this.state.waterfall.state.sources).filter(s => s.incomeIds.some(i => this.statement.incomeIds.includes(i)));
      const incomeIds = sources.map(s => s.incomeIds).flat();
      const history = transfers.map(t => t.history.filter(h => h.checked && incomeIds.includes(h.incomeId))).flat();
      const currentCalculatedRevenue = sum(history, i => i.amount * i.percent);
      return { [mainCurrency]: currentCalculatedRevenue };
    }
  }

  private buildGraph() {

    const history = getStatementsHistory(
      this.state.waterfall.history,
      this.statements.filter(s => s.type === this.statement.type),
      this.statement.rightholderId,
      this.contract?.id
    );

    const categories = history.map(h => new Date(h.date).toISOString().slice(0, 10));
    const series = [
      {
        name: 'Revenue',
        data: history.map(h => Math.round(h.orgs[this.statement.rightholderId].revenu.actual))
      },
      {
        name: 'Turnover',
        data: history.map(h => Math.round(h.orgs[this.statement.rightholderId].turnover.actual))
      }
    ];
    this.options = { xAxis: { categories }, series };
  }

  public showRightDetails({ id: rightId }: { id: string }) {
    const sources = this.getAssociatedSourceIds(rightId);

    this.rightDetails = sources.map(sourceId => {
      const sourceDetails: RightDetails[] = [];
      // Fetch incomes that are in the statement duration
      const incomeIds = this.state.waterfall.state.sources[sourceId].incomeIds.filter(i => this.statement.incomeIds.includes(i));

      const path = getPath(rightId, sourceId, this.state.waterfall.state);
      path.forEach((item, index) => {
        if (path[index + 1]) {
          const to = getNode(this.state.waterfall.state, path[index + 1]);
          const from = getNode(this.state.waterfall.state, item);
          const transfer = this.state.waterfall.state.transfers[`${from.id}->${to.id}`];
          let amount = 0;
          if (transfer) {
            const incomes = transfer.history.filter(h => incomeIds.includes(h.incomeId));
            amount = sum(incomes.filter(i => i.checked), i => i.amount);
          }

          let taken = 0;
          if (isGroup(this.state.waterfall.state, to)) {
            const innerTransfers = to.children.map(c => this.state.waterfall.state.transfers[`${to.id}->${c}`]).filter(t => !!t);
            const innerIncomes = innerTransfers.map(t => t.history.filter(h => incomeIds.includes(h.incomeId))).flat();
            taken = sum(innerIncomes.filter(i => i.checked), i => i.amount * i.percent);
          } else {
            taken = amount * to.percent;
          }

          const percent = isGroup(this.state.waterfall.state, to) && amount ? (taken / amount) : to.percent;

          sourceDetails.push({
            from: isSource(this.state.waterfall.state, from) ? this.waterfall.sources.find(s => s.id === from.id).name : this.allRights.find(r => r.id === from.id).name,
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

      const isInternal = right.rightholderId === this.statement.rightholderId;
      const amount = this.getCalculatedAmount(right.id);
      const payment = createRightPayment({
        id: this.statementService.createId(),
        to: right.id,
        price: amount[mainCurrency],
        currency: mainCurrency,
        date: isInternal ? this.statement.duration.to : undefined,
        incomeIds: this.statement.incomeIds.filter(id => {
          const income = this.incomes.find(i => i.id === id);
          const source = getAssociatedSource(income, this.waterfall.sources);
          return pathExists(right.id, source.id, this.state.waterfall.state);
        }),
        mode: isInternal ? 'internal' : 'external'
      });

      if (payment.price > 0) this.statement.payments.right.push(payment);
    }

    // Rightholder Payments
    if ((isDistributorStatement(this.statement) || isProducerStatement(this.statement)) && !this.statement.payments.rightholder) {
      const to = this.contract.sellerId === this.statement.rightholderId ? this.contract.buyerId : this.contract.sellerId;
      const price = this.getRightholderPaymentPrice();
      const externalRights = this.rights.filter(r => r.rightholderId !== this.statement.rightholderId);

      // Sum of external right payments
      this.statement.payments.rightholder = createRightholderPayment({
        id: this.statementService.createId(),
        price: price,
        currency: mainCurrency,
        date: undefined,
        incomeIds: this.statement.incomeIds.filter(id => {
          const income = this.incomes.find(i => i.id === id);
          const source = getAssociatedSource(income, this.waterfall.sources);
          return externalRights.some(r => pathExists(r.id, source.id, this.state.waterfall.state));
        }),
        to
      });
    }

  }

  private getRightholderPaymentPrice() {
    if (isDistributorStatement(this.statement)) {
      // Total income received
      const incomes = this.statement.incomeIds.map(id => this.state.waterfall.state.incomes[id]);
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
    await this.statementService.update(this.statement, { params: { waterfallId: this.waterfall.id } });
    this.statement = await this.statementService.getValue(this.statement.id, { waterfallId: this.waterfall.id });

    await this.waterfallService.refreshWaterfall(this.waterfall.id, this.state.version.id);
    await this.buildWaterfallState(this.state.version.id);
    this.buildGraph();
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
    this.statement = await this.statementService.getValue(this.statement.id, { waterfallId: this.waterfall.id });

    await this.waterfallService.refreshWaterfall(this.waterfall.id, this.state.version.id, { refreshData: true });
    await this.buildWaterfallState(this.state.version.id);
    this.buildGraph();
    this.cdRef.markForCheck();
  }
}

@Pipe({ name: 'filterRights' })
export class FilterRightsPipe implements PipeTransform {
  transform(rights: Right[], statement: Statement) {
    if (isDistributorStatement(statement) || isDirectSalesStatement(statement)) return rights.filter(r => r.rightholderId === statement.rightholderId);
    if (isProducerStatement(statement)) return rights;
  }
}