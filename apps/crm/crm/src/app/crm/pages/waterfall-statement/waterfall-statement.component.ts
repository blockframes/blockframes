import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
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
  RightholderPayment,
  isProducerStatement,
  WaterfallContract,
  createRightPayment,
  createRightholderPayment,
  DistributorStatement,
  createIncomePayment,
  getPath,
  getRightsOf
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

  async ngOnInit() {
    const waterfallId = this.route.snapshot.paramMap.get('waterfallId');
    const statementId = this.route.snapshot.paramMap.get('statementId');

    const data = await this.waterfallService.loadWaterfalldata(waterfallId);
    this.movie = await this.movieService.getValue(waterfallId);
    this.waterfall = data.waterfall;
    this.allRights = data.rights;
    this.statements = data.statements;
    this.statement = this.statements.find(s => s.id === statementId);

    this.contract = data.contracts.find(c => c.id === this.statement.contractId);
    if (!this.contract) {
      this.snackBar.open(`Contract "${this.statement.contractId}" not found in waterfall.`, 'close', { duration: 5000 });
      return;
    }
    this.incomes = data.incomes.filter(i => this.statement.incomeIds.includes(i.id));
    this.sources = this.incomes.map(i => getAssociatedSource(i, this.waterfall.sources));

    if (isDistributorStatement(this.statement)) {
      this.expenses = data.expenses.filter(e => (this.statement as DistributorStatement).expenseIds.includes(e.id));

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

    if (!this.waterfall.versions[0]?.id) { // Waterfall was never initialized
      await this.waterfallService.initWaterfall(this.waterfall.id, { id: 'version_1', description: 'Version 1' });
    }

    await this.loadWaterfall(this.waterfall.versions[0].id);

    if (this.statement.incomeIds.some(i => !this.state.waterfall.state.incomes[i])) { // Some incomes are not in the waterfall
      await this.waterfallService.refreshWaterfall(this.waterfall.id, this.state.version.id);
      await this.loadWaterfall(this.waterfall.versions[0].id);
    }

    await this.buildGraph();

    const rightIds = unique(this.sources.map(s => this.getAssociatedRights(s.id)).flat().map(r => r.id));
    this.rights = this.allRights.filter(r => rightIds.includes(r.id));

    this.generatePayments();

    this.cdRef.markForCheck();
  }

  public async loadWaterfall(versionId: string) {
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
    const rightholder = this.waterfall.rightholders.find(r => r.id === id)?.name || this.waterfall.rightholders.find(r => r.id === this.rights.find(r => r.id === id)?.rightholderId)?.name;

    return rightholder || '--';
  }

  public getRightholderActual(type: 'revenu' | 'turnover') {
    return { [mainCurrency]: this.state.waterfall.state.orgs[this.statement.rightholderId][type].actual };
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
      rightholderRights = this.allRights.filter(r => r.rightholderId === this.statement.rightholderId);
    } else if (isProducerStatement(this.statement)) {
      rightholderRights = getRightsOf(this.allRights, this.contract); // TODO #9493 use this for all statements types ?
    } else {
      // TODO #9493
    }

    if (!this.state.waterfall.state.sources[sourceId]) {
      this.snackBar.open(`Source "${sourceId}" not found in waterfall.`, 'close', { duration: 5000 });
      console.log(`Source "${sourceId}" not found in waterfall. Check incomes and statement dates.`);
      return [];
    }

    for (const right of rightholderRights) {
      const sources = getSources(this.state.waterfall.state, [right.id]);
      if (sources.find(s => s.id === sourceId)) rightsFromSource.push(right);
    }

    return rightsFromSource;
  }

  // TODO #9493 not used
  private getOrderedRightsForSource(sourceId: string) {
    const orderedRights: Record<number, string> = {};
    const rights = this.getAssociatedRights(sourceId);
    if (isDistributorStatement(this.statement)) {
      const commissions = rights.filter(r => r.type === 'commission');
      const expenses = rights.filter(r => r.type === 'expenses');
      const mgs = rights.filter(r => r.type === 'mg');

      let i = 0;
      if (commissions.length) commissions.forEach(c => orderedRights[i++] = c.id);
      if (expenses.length) expenses.forEach(e => orderedRights[i++] = e.id);
      if (mgs.length) mgs.forEach(m => orderedRights[i++] = m.id);
    } else {
      // TODO 
    }

    return orderedRights;
  }

  public getRightPayment(rightId: string) {
    const payment = this.statement.payments.internal.find(p => p.to === rightId) || this.statement.payments.external.find(p => p.to === rightId);
    return payment ? this.toPricePerCurrency(payment) : { [mainCurrency]: 0 };
  }

  public getCalculatedAmount(rightId: string, cumulated = false): PricePerCurrency {
    // TODO #9493 this might be wrong if rights takes money from multiple parents rights that does not belong to current rightholder
    const currentCalculatedRevenue = this.state.waterfall.state.rights[rightId].revenu.calculated;
    if (this.state.waterfall.history.length > 1 && !cumulated) {
      const previousStatement = this.getPreviousStatement();
      const previousCalculatedRevenue = previousStatement?.rights[rightId].revenu.calculated || 0;
      return { [mainCurrency]: currentCalculatedRevenue - previousCalculatedRevenue };
    } else {
      return { [mainCurrency]: currentCalculatedRevenue };
    }
  }

  public async buildGraph() {

    const history = this.getStatementsHistory();

    const categories = history.map(h => new Date(h.date).toISOString().slice(0, 10));
    const series = [
      {
        name: 'Revenue',
        data: history.map(h => h.orgs[this.statement.rightholderId].revenu.actual)
      },
      {
        name: 'Turnover',
        data: history.map(h => h.orgs[this.statement.rightholderId].turnover.actual)
      }
    ];
    this.options = { xAxis: { categories }, series };
  }

  /**
   * 
   * @returns the state history for the statements generated by this rightholder for this contract
   */
  private getStatementsHistory() {
    const statements = this.statements.filter(s => s.rightholderId === this.statement.rightholderId && s.contractId === this.statement.contractId);
    const sortedStatements = sortByDate(statements, 'duration.to');
    return sortedStatements
      .map(s => this.state.waterfall.history.find(h => new Date(h.date).getTime() === s.duration.to.getTime()))
      .filter(h => !!h);
  }

  /**
   * 
   * @returns state of the previous statement generated by this rightholder for this contract
   */
  private getPreviousStatement() {
    const statementHistory = this.getStatementsHistory();
    const isCurrentStatementInHistory = statementHistory.find(h => new Date(h.date).getTime() === this.statement.duration.to.getTime());
    if (!isCurrentStatementInHistory && statementHistory.length) return statementHistory[statementHistory.length - 1];
    if (statementHistory.length >= 2) return statementHistory[statementHistory.length - 2];
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

  public async markAsReceived(payment: RightholderPayment) {
    const externalPayment = this.statement.payments.external.find(p => p.id === payment.id);
    externalPayment.status = 'received';

    if (!this.statement.payments.external.find(p => p.status !== 'received')) {
      this.statement.status = 'pending';
    }

    await this.statementService.update(this.statement, { params: { waterfallId: this.waterfall.id } });
    this.statement = await this.statementService.getValue(this.statement.id, { waterfallId: this.waterfall.id });
    this.cdRef.markForCheck();
  }

  private generatePayments() {

    // Right Payments
    for (const right of this.rights) {
      const paymentExists = this.statement.payments.internal.find(p => p.to === right.id) || this.statement.payments.external.find(p => p.to === right.id);
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
      });

      if (payment.price > 0) this.statement.payments[isInternal ? 'internal' : 'external'].push(payment);
    }

    // Rightholder Payments
    const paymentSum = sum(this.statement.payments.internal, p => p.price) + sum(this.statement.payments.external, p => p.price);

    if (isDistributorStatement(this.statement)) {
      const incomes = this.statement.incomeIds.map(id => this.state.waterfall.state.incomes[id]);
      const incomeSum = sum(incomes, i => i.amount);
      const price = incomeSum - paymentSum;
      if (!this.statement.payments.external.find(p => p.type === 'rightholder')) {
        const payment = createRightholderPayment({
          id: this.statementService.createId(),
          price,
          currency: mainCurrency,
          date: this.statement.duration.to,
          incomeIds: this.statement.incomeIds, // TODO #9493 use getIncomesRelatedToPayment() for all rights of this rightholder?
          to: this.contract.sellerId
        });
        this.statement.payments.external.push(payment);
      }

    } else {
      // TODO #9493 if paymentSum (outgoing) != incoming payments => create rightholder payment
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
    this.statement.status = this.statement.payments.external.filter(e => e.type === 'rightholder').length ? 'pending' : 'processed';

    // Validate all "right" payments
    this.statement.payments.internal = this.statement.payments.internal.map(p => ({ ...p, status: 'processed' }));
    this.statement.payments.external = this.statement.payments.external.map(p => (p.type === 'right' ? { ...p, status: 'processed' } : p));
    await this.statementService.update(this.statement, { params: { waterfallId: this.waterfall.id } });
    this.statement = await this.statementService.getValue(this.statement.id, { waterfallId: this.waterfall.id });

    // TODO #9493 find another way to prevent to create another similar payment in dashboard
    // Update parent payments & statements status
    /*if (isProducerStatement(this.statement)) {
      for (const parent of this.statement.parentPayments) {
        const statement = await this.statementService.getValue(parent.statementId, { waterfallId: this.waterfall.id });
        const payment = statement.payments.external.find(p => p.id === parent.paymentId);
        payment.status = 'processed';

        if (!statement.payments.external.find(p => p.status !== 'processed')) {
          statement.status = 'processed';
        }

        await this.statementService.update<Statement>(statement, { params: { waterfallId: this.waterfall.id } });
      }
    }*/

    await this.waterfallService.refreshWaterfall(this.waterfall.id, this.state.version.id);
    await this.loadWaterfall(this.state.version.id);
    await this.buildGraph();
    this.cdRef.markForCheck();
  }
}