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
  History,
  mainCurrency,
  isDistributorStatement,
  isProducerStatement,
  isFinancierStatement,
  sortByDate
} from '@blockframes/model';
import { MovieService } from '@blockframes/movie/service';
import { RightService } from '@blockframes/waterfall/right.service';
import { StatementService } from '@blockframes/waterfall/statement.service';
import { WaterfallService } from '@blockframes/waterfall/waterfall.service';
import { where } from 'firebase/firestore';

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
  public incomes: Income[];
  public expenses: Expense[];
  public rights: Right[];
  public currentVersion: string;

  public histories: History[];
  public currentHistory: History;
  public previousHistory: History;

  public options = {
    xAxis: { categories: [] },
    series: [],
  }

  public formatter = {
    percent: {
      formatter: (value: number) => `${value} €`,
    }
  };

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

    const [movie, waterfall, statement] = await Promise.all([
      this.movieService.getValue(waterfallId),
      this.waterfallService.getValue(waterfallId),
      this.statementService.getValue(statementId, { waterfallId })
    ]);

    this.movie = movie;
    this.waterfall = waterfall;

    this.statement = statement;
    if (isDistributorStatement(this.statement)) {
      this.incomes = await this.incomeService.getValue(this.statement.incomes.map(i => i.incomeId));
      this.expenses = await this.expenseService.getValue(this.statement.expenseIds);

      const rightIds = Array.from(new Set(this.statement.incomes.map(i => Object.values(i.rights)).flat()));
      this.rights = await this.rightService.getValue(rightIds, { waterfallId });
    } else if (isProducerStatement(this.statement) || isFinancierStatement(this.statement)) {
      const rightIds = Array.from(new Set(this.statement.payments.internal.map(i => i.to)));
      this.rights = await this.rightService.getValue(rightIds, { waterfallId });
    }

    const statements = await this.statementService.getValue([
      where('contractId', '==', this.statement.contractId),
      where('rightholderId', '==', this.statement.rightholderId),
    ], { waterfallId });

    this.statements = sortByDate(statements, 'duration.to');

    this.currentVersion = this.waterfall.versions[0].id;
    await this.setVersion(this.currentVersion);
    this.buildGraph();
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
    return { [mainCurrency]: this.currentHistory.orgs[this.statement.rightholderId][type].actual };
  }

  public getAssociatedSource(income: Income) {
    try {
      return getAssociatedSource(income, this.waterfall.sources)?.name || '--';
    } catch (error) {
      if (this.snackBar._openedSnackBarRef === null) this.snackBar.open(error, 'close', { duration: 5000 });
    }
  }

  public getAssociatedIncomeIds(rightId: string) {
    if (isDistributorStatement(this.statement)) {
      const incomeIds = this.statement.incomes.filter(i => Object.values(i.rights).includes(rightId)).map(i => i.incomeId);
      return incomeIds.join(' , ');
    } else {
      return 'TODO';
    }
  }

  public getInternalPayment(rightId: string) {
    const payment = this.statement.payments.internal.find(p => p.to === rightId);
    return this.toPricePerCurrency(payment);
  }

  public async setVersion(versionId: string) {
    this.snackBar.open('Waterfall is loading. Please wait', 'close', { duration: 5000 });
    const data = await this.waterfallService.buildWaterfall({ waterfallId: this.waterfall.id, versionId });

    this.histories = data.waterfall.history.filter(h => new Date(h.date).getTime() <= this.statement.duration.to.getTime());
    this.currentHistory = this.histories[this.histories.length - 1];
    if (this.histories.length > 1) this.previousHistory = this.histories[this.histories.length - 2];

    this.snackBar.open('Waterfall loaded !', 'close', { duration: 5000 });
  }

  public getCalculatedAmount(rightId: string, cumulated = false) {
    const currentCalculatedRevenue = this.currentHistory.rights[rightId].revenu.calculated;
    if (this.previousHistory && !cumulated) {
      const previousCalculatedRevenue = this.previousHistory.rights[rightId].revenu.calculated;
      return { [mainCurrency]: currentCalculatedRevenue - previousCalculatedRevenue || currentCalculatedRevenue };
    } else {
      return { [mainCurrency]: currentCalculatedRevenue };
    }

  }

  public buildGraph() {
    const histories = this.statements.map(s =>
      this.histories.find(h => new Date(h.date).getTime() === s.duration.to.getTime())
    ).filter(h => !!h);

    const categories = histories.map(h => new Date(h.date).toISOString().slice(0, 10));
    const series = [
      {
        name: 'Revenue',
        data: histories.map(h => h.orgs[this.statement.rightholderId].revenu.actual)
      },
      {
        name: 'Turnover',
        data: histories.map(h => h.orgs[this.statement.rightholderId].turnover.actual)
      }
    ];
    this.options = { xAxis: { categories }, series };
  }

}