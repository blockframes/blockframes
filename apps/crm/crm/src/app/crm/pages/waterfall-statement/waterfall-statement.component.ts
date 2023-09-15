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
  isDistributorStatement
} from '@blockframes/model';
import { MovieService } from '@blockframes/movie/service';
import { RightService } from '@blockframes/waterfall/right.service';
import { StatementService } from '@blockframes/waterfall/statement.service';
import { WaterfallService } from '@blockframes/waterfall/waterfall.service';

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
  public currentVersion: string;
  public currentHistory: History;
  public previousHistory: History;

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
    }

    this.currentVersion = this.waterfall.versions[0].id;
    await this.setVersion(this.currentVersion);
    this.cdRef.markForCheck();
  }

  // TODO Créer une méthode de parcours du waterfall pour aller d'un right => la ou ses sources d'income
  // find rights by orgId (and contractId) => pour chaque right, on remonte l'arbre pour trouver le ou les incomes associés
  // pour générer: 
  /**
   * rights: {
          1 : 'playtime_com',
          2 : 'playtime_expenses',
          3 : 'playtime_mg'
        }
      
    ET 
    pour dire pourquoi, pour un tel income, j'ai ce montant pour ce droit : montrer historique de ce qui a été pris au dessus par les autres orgs
   */

  public toPricePerCurrency(item: Income | Expense | Payment): PricePerCurrency {
    return { [item.currency]: item.price };
  }

  public getRightholderName(id: string) {
    if (!id) return '--';
    return this.waterfall.rightholders.find(r => r.id === id)?.name || '--';
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
    }
  }

  public getInternalPayment(rightId: string) {
    const payment = this.statement.payments.internal.find(p => p.to === rightId);
    return this.toPricePerCurrency(payment);
  }

  public async setVersion(versionId: string) {
    this.snackBar.open('Waterfall is loading. Please wait', 'close', { duration: 5000 });
    const data = await this.waterfallService.buildWaterfall({ waterfallId: this.waterfall.id, versionId });

    const histories = data.waterfall.history.filter(h => new Date(h.date).getTime() <= this.statement.duration.to.getTime());

    this.currentHistory = histories.pop();
    this.previousHistory = histories.pop();
    this.snackBar.open('Waterfall loaded !', 'close', { duration: 5000 });
  }

  public getCalculatedAmount(rightId: string, cumulated = false) {
    const currentCalculatedRevenue = this.currentHistory.rights[rightId].revenu.calculated;
    if (this.previousHistory && !cumulated) {
      const previousCalculatedRevenue = this.previousHistory.rights[rightId].revenu.calculated;
      return { [mainCurrency]: currentCalculatedRevenue - previousCalculatedRevenue };
    } else {
      return { [mainCurrency]: currentCalculatedRevenue };
    }

  }

}