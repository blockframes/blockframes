import { ChangeDetectionStrategy, Component, Input, OnDestroy, OnInit, Pipe, PipeTransform } from '@angular/core';
import { WaterfallSource, createExpense, createIncome, getRightsExpenseTypes } from '@blockframes/model';
import { DashboardWaterfallShellComponent } from '../../../dashboard/shell/shell.component';
import { RevenueSimulationForm } from '../../../form/revenue-simulation.form';
import { ExpenseForm, IncomeForm } from '../../../form/statement.form';
import { Subscription, combineLatest, map, startWith } from 'rxjs';
import { IncomeService } from '@blockframes/contract/income/service';
import { dateInputFormat } from '@blockframes/utils/date-adapter';

@Component({
  selector: 'waterfall-revenue-simulation-form',
  templateUrl: './revenue-simulation-form.component.html',
  styleUrls: ['./revenue-simulation-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WaterfallRevenueSimulationFormComponent implements OnInit, OnDestroy {
  @Input() form: RevenueSimulationForm;
  public sources$ = this.shell.sources$;
  public expenseTypes$ = combineLatest([this.shell.waterfall$, this.shell.rightholderRights$]).pipe(
    map(([waterfall, rights]) => {
      const expenseTypes = Object.values(waterfall.expenseTypes).flat();
      const rightsExpenseTypes = getRightsExpenseTypes(rights);
      return expenseTypes.filter(i => rightsExpenseTypes.includes(i.id));
    })
  );
  public versionId$ = this.shell.versionId$;
  public waterfall = this.shell.waterfall;
  public dateInputFormat = dateInputFormat;

  private producer = this.shell.waterfall.rightholders.find(r => r.roles.includes('producer'));
  private sub: Subscription;
  constructor(
    private shell: DashboardWaterfallShellComponent,
    private incomeService: IncomeService,
  ) { }

  ngOnInit() {
    const date = this.form.get('date').valueChanges.pipe(startWith(this.form.get('date').value));
    this.sub = combineLatest([date, this.sources$, this.expenseTypes$, this.shell.rightholderContracts$]).pipe(
      map(([date, sources, expenseTypes, contracts]) => {
        const incomes = this.form.get('incomes').value;
        const expenses = this.form.get('expenses').value;
        this.form.get('incomes').hardReset([]);
        this.form.get('expenses').hardReset([]);
        sources.forEach((source, index) => {
          this.form.get('incomes').setControl(index, new IncomeForm(createIncome({
            id: this.incomeService.createId(),
            sourceId: source.id,
            status: 'received',
            date,
            titleId: this.waterfall.id,
            // TODO #9624 contractId for contractAmount, contractDate & contract conditions
            price: incomes.find(i => i.sourceId === source.id)?.price || 0
          })));
        });

        expenseTypes.forEach((expenseType, index) => {
          const contract = contracts.find(c => c.id === expenseType.contractId);
          const otherParty = contract?.sellerId === this.producer.id ? contract?.buyerId : contract?.sellerId;
          const rightholderId = expenseType.contractId === 'directSales' ? this.producer.id : otherParty;
          this.form.get('expenses').setControl(index, new ExpenseForm(createExpense({
            id: this.incomeService.createId(),
            typeId: expenseType.id,
            contractId: expenseType.contractId,
            status: 'received',
            date,
            rightholderId,
            titleId: this.waterfall.id,
            capped: expenses.find(i => i.typeId === expenseType.id)?.capped || false,
            price: expenses.find(i => i.typeId === expenseType.id)?.price || 0
          })));
        });

      })
    ).subscribe();
  }

  ngOnDestroy() {
    this.sub?.unsubscribe();
  }
}

@Pipe({ name: 'sourceName' })
export class SourceNamePipe implements PipeTransform {
  transform(sourceId: string, sources: WaterfallSource[]) {
    return sources.find(source => source.id === sourceId)?.name || '--';
  }
}