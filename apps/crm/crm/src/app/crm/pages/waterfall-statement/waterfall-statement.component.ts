import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute } from '@angular/router';
import { ExpenseService } from '@blockframes/contract/expense/service';
import { IncomeService } from '@blockframes/contract/income/service';
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
  getNodesSubTree,
  getNode,
  sum,
  isSource,
  isGroup,
  movieCurrencies
} from '@blockframes/model';
import { MovieService } from '@blockframes/movie/service';
import { RightService } from '@blockframes/waterfall/right.service';
import { StatementService } from '@blockframes/waterfall/statement.service';
import { WaterfallService, WaterfallState } from '@blockframes/waterfall/waterfall.service';
import { where } from 'firebase/firestore';

function getAllValidPaths(from: string, to: string, subTree: { node: string, parents: string[] }[] = []) {
  const paths: string[][] = [];
  const parents = subTree.find(n => n.node === from).parents;
  if (parents.includes(to)) {
    paths.push([from, to]);
  } else {
    for (const parent of parents) {
      const subPaths = getAllValidPaths(parent, to, subTree);
      paths.push(...subPaths.map(p => [from, ...p]));
    }
  }
  return paths;
}

function getPath(from: string, to: string, subTree: { node: string, parents: string[] }[]) {
  const paths = getAllValidPaths(from, to, subTree);
  if (paths.length > 1) throw new Error(`Too many paths between ${from} and ${to}`);
  if (paths.length === 0) throw new Error(`No path between ${from} and ${to}`);
  return paths[0].reverse();
}

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
    private incomeService: IncomeService,
    private expenseService: ExpenseService,
    private rightService: RightService,
    private route: ActivatedRoute,
    private cdRef: ChangeDetectorRef,
    private snackBar: MatSnackBar,
  ) { }

  async ngOnInit() {
    const waterfallId = this.route.snapshot.paramMap.get('waterfallId');
    const statementId = this.route.snapshot.paramMap.get('statementId');

    const [movie, waterfall, statement, allRights] = await Promise.all([
      this.movieService.getValue(waterfallId),
      this.waterfallService.getValue(waterfallId),
      this.statementService.getValue(statementId, { waterfallId }),
      this.rightService.getValue({ waterfallId })
    ]);

    this.movie = movie;
    this.waterfall = waterfall;
    this.allRights = allRights;
    this.statement = statement;

    await this.loadWaterfall(this.waterfall.versions[0].id);
    await this.buildGraph();

    this.incomes = await this.incomeService.getValue(this.statement.incomeIds);

    if (isDistributorStatement(this.statement)) {
      this.expenses = await this.expenseService.getValue(this.statement.expenseIds);
    }

    const rightIds = Array.from(new Set(this.statement.payments.internal.map(i => i.to)));
    this.rights = this.allRights.filter(r => rightIds.includes(r.id));

    this.cdRef.markForCheck();
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
    const incomeSources = this.incomes.map(i => getAssociatedSource(i, this.waterfall.sources).id);
    return rightSources.filter(s => incomeSources.includes(s));
  }

  public getInternalPayment(rightId: string) {
    const payment = this.statement.payments.internal.find(p => p.to === rightId);
    return this.toPricePerCurrency(payment);
  }

  public async loadWaterfall(versionId: string) {
    this.snackBar.open('Waterfall is loading. Please wait', 'close', { duration: 5000 });
    this.state = await this.waterfallService.buildWaterfall({ waterfallId: this.waterfall.id, versionId, date: this.statement.duration.to });
    this.snackBar.open('Waterfall loaded !', 'close', { duration: 5000 });
  }

  public getCalculatedAmount(rightId: string, cumulated = false) {
    const currentCalculatedRevenue = this.state.waterfall.state.rights[rightId].revenu.calculated;
    if (this.state.waterfall.previous && !cumulated) {
      const previousCalculatedRevenue = this.state.waterfall.previous.rights[rightId].revenu.calculated;
      return { [mainCurrency]: currentCalculatedRevenue - previousCalculatedRevenue || currentCalculatedRevenue };
    } else {
      return { [mainCurrency]: currentCalculatedRevenue };
    }
  }

  public async buildGraph() {

    const statements = await this.statementService.getValue([
      where('contractId', '==', this.statement.contractId),
      where('rightholderId', '==', this.statement.rightholderId),
    ], { waterfallId: this.waterfall.id });

    const sortedStatements = sortByDate(statements, 'duration.to');

    const history = sortedStatements
      .map(s => this.state.waterfall.history.find(h => new Date(h.date).getTime() === s.duration.to.getTime()))
      .filter(h => !!h);

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

  public showRightDetails({ id: rightId }: { id: string }) {
    const sources = this.getAssociatedSourceIds(rightId);

    this.rightDetails = sources.map(sourceId => {
      const sourceDetails: RightDetails[] = [];
      // Fetch incomes that are in the statement duration
      const incomeIds = this.state.waterfall.state.sources[sourceId].incomeIds.filter(i => this.statement.incomeIds.includes(i));
      const subTree = getNodesSubTree(this.state.waterfall.state, [rightId]);

      const path = getPath(rightId, sourceId, subTree);
      path.forEach((item, index) => {
        if (path[index + 1]) {
          const to = getNode(this.state.waterfall.state, path[index + 1]);
          const from = getNode(this.state.waterfall.state, item);
          const transfer = this.state.waterfall.state.transfers[`${from.id}->${to.id}`];
          const incomes = transfer.history.filter(h => incomeIds.includes(h.incomeId));
          const amount = sum(incomes.filter(i => i.checked), i => i.amount);

          let taken = 0;
          if (isGroup(this.state.waterfall.state, to)) {
            const innerTransfers = to.children.map(c => this.state.waterfall.state.transfers[`${to.id}->${c}`]);
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
}