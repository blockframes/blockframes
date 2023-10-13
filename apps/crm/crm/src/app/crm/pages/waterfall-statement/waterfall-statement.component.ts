import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, Pipe, PipeTransform } from '@angular/core';
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
  sortByDate,
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
  isDirectSalesStatement
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
  private statements: Statement[];
  private contract: WaterfallContract;
  public incomes: Income[];
  public sources: WaterfallSource[];
  public expenses: Expense[];
  public rights: Right[];
  public rightDetails: RightDetails[][] = [];
  public currency = mainCurrency;
  public options = { xAxis: { categories: [] }, series: [] };
  public formatter = { percent: { formatter: (value: number) => `${value} ${movieCurrencies[mainCurrency]}` } };
  public state: WaterfallState;

  private allRights: Right[];

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

    await this.buildGraph();

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
    return { [mainCurrency]: this.state.waterfall.state.orgs[this.statement.rightholderId][type].actual };
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

    let rightholderRights: Right[] = []
    if (isDistributorStatement(this.statement)) {
      rightholderRights = this.allRights.filter(r => [this.contract.buyerId, this.contract.sellerId].includes(r.rightholderId));
    } else if (isProducerStatement(this.statement)) {
      const otherParty = this.contract.sellerId === this.statement.rightholderId ? this.contract.buyerId : this.contract.sellerId;
      rightholderRights = this.allRights.filter(r => otherParty === r.rightholderId);
    } else if (isDirectSalesStatement(this.statement)) {
      rightholderRights = this.allRights.filter(r => r.rightholderId === this.statement.rightholderId);
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

  public async buildGraph() {

    const history = this.getStatementsHistory();

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

  /**
   * 
   * @returns the state history for the statements generated by this rightholder for this contract
   */
  private getStatementsHistory() {

    let statements: Statement[] = [];

    if (isDistributorStatement(this.statement) || isProducerStatement(this.statement)) {
      const statement = this.statement;
      statements = this.statements
        .filter(s => s.rightholderId === this.statement.rightholderId)
        .filter(s => (isDistributorStatement(s) || isProducerStatement(s)) && s.contractId === statement.contractId);
    } else if (isDirectSalesStatement(this.statement)) {
      statements = this.statements
        .filter(s => s.rightholderId === this.statement.rightholderId)
        .filter(s => isDirectSalesStatement(s));
    }

    const sortedStatements = sortByDate(statements, 'duration.to');
    return sortedStatements
      .map(s => this.state.waterfall.history.find(h => new Date(h.date).getTime() === s.duration.to.getTime()))
      .filter(h => !!h);
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

  public async markAsReceived() {
    if (!isDistributorStatement(this.statement) && !isProducerStatement(this.statement)) return;
    const rightholderPayment = this.statement.payments.rightholder;
    rightholderPayment.status = 'received';

    if (rightholderPayment.status === 'received') {
      this.statement.status = 'processed';
    }

    await this.statementService.update(this.statement, { params: { waterfallId: this.waterfall.id } });
    this.statement = await this.statementService.getValue(this.statement.id, { waterfallId: this.waterfall.id });

    await this.waterfallService.refreshWaterfall(this.waterfall.id, this.state.version.id, { refreshData: true });
    await this.buildWaterfallState(this.state.version.id);
    await this.buildGraph();
    this.cdRef.markForCheck();
  }

  private generatePayments() {

    // Right Payments
    for (const right of this.rights) {
      const paymentExists = this.statement.payments.right.find(p => p.to === right.id);
      if (paymentExists) continue;

      const incomeIds = this.getIncomesRelatedToPayment(right.id);

      const isInternal = right.rightholderId === this.statement.rightholderId;
      const amount = this.getCalculatedAmount(right.id);
      const payment = createRightPayment({
        id: this.statementService.createId(),
        to: right.id,
        price: amount[mainCurrency],
        currency: mainCurrency,
        date: this.statement.duration.to,
        incomeIds,
        mode: isInternal ? 'internal' : 'external'
      });

      if (payment.price > 0) this.statement.payments.right.push(payment);
    }

    // Rightholder Payments
    if ((isDistributorStatement(this.statement) || isProducerStatement(this.statement)) && !this.statement.payments.rightholder) {
      const to = this.contract.sellerId === this.statement.rightholderId ? this.contract.buyerId : this.contract.sellerId;
      const price = this.getRightholderPaymentPrice();

      // Sum of external right payments
      this.statement.payments.rightholder = createRightholderPayment({
        id: this.statementService.createId(),
        price: price,
        currency: mainCurrency,
        date: this.statement.duration.to,
        incomeIds: this.statement.incomeIds,
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

  private getIncomesRelatedToPayment(rightId: string) {
    const sources = this.getAssociatedSourceIds(rightId);
    const incomes = this.incomes.filter(i => {
      const incomeSource = getAssociatedSource(i, this.waterfall.sources);
      return sources.includes(incomeSource.id);
    });

    const transfers = Object.values(this.state.waterfall.state.transfers).filter(t => t.to === rightId);
    const transferedIncomes = unique(transfers.map(t => t.history.filter(h => h.checked)).flat().map(h => h.incomeId));
    return incomes.map(i => i.id).filter(i => transferedIncomes.includes(i));
  }

  public async validate() {
    this.statement.status = ((isDistributorStatement(this.statement) || isProducerStatement(this.statement)) && this.statement.payments.rightholder) ? 'pending' : 'processed';

    // Validate all "right" payments
    this.statement.payments.right = this.statement.payments.right.map(p => ({ ...p, status: 'processed' }));
    await this.statementService.update(this.statement, { params: { waterfallId: this.waterfall.id } });
    this.statement = await this.statementService.getValue(this.statement.id, { waterfallId: this.waterfall.id });

    await this.waterfallService.refreshWaterfall(this.waterfall.id, this.state.version.id);
    await this.buildWaterfallState(this.state.version.id);
    await this.buildGraph();
    this.cdRef.markForCheck();
  }
}

@Pipe({ name: 'filterRights' })
export class FilterRightsPipe implements PipeTransform {
  transform(rights: Right[], statement: Statement) {
    if (isDistributorStatement(statement) || isDirectSalesStatement(statement)) return rights.filter(r => r.rightholderId === statement.rightholderId);
    if (isProducerStatement(statement)) return rights.filter(r => r.rightholderId !== statement.rightholderId);
  }
}