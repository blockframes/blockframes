import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { ConditionInterest, getRightCondition, getSortedOperations, investmentWithInterest } from '@blockframes/model';
import { DashboardWaterfallShellComponent } from '../../dashboard/shell/shell.component';
import { combineLatest, map } from 'rxjs';
import { differenceInDays } from 'date-fns';

interface InvestmentDetails {
  event: string;
  invested: number;
  revenues: number;
  date: Date;
  amountOwed: number;
  periodDays: number;
  periodInterests: number;
  interests: number;
  interestOwed: number;
}

@Component({
  selector: 'waterfall-interest-table',
  templateUrl: './interest-table.component.html',
  styleUrls: ['./interest-table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class InterestTableComponent {
  @Input() contractId: string;

  private contract$ = this.shell.contracts$.pipe(
    map(contracts => contracts.find(c => c.id === this.contractId)),
  );

  private rights$ = this.shell.rights$.pipe(
    map(rights => rights.filter(r => r.contractId === this.contractId))
  );

  public interests$ = combineLatest([this.rights$, this.shell.state$, this.contract$]).pipe(
    map(([rights, state, contract]) => {

      const allConditions = rights.map(right => getRightCondition(right)).filter(condition => !!condition).flat();
      const interestCondition = allConditions.find(condition => condition.name === 'interest');
      if (!interestCondition) return;
      const payload = interestCondition.payload as ConditionInterest;

      const orgs = Object.values(state.waterfall.state.orgs);
      const orgOperations = orgs.find(org => org.operations.some(o => o.contractId === contract.id)).operations;
      const contractOperations = orgOperations.filter(o => o.type === 'income' || (o.type === 'investment' && o.contractId === contract.id));

      const operations = getSortedOperations(contractOperations);

      const results: InvestmentDetails[] = [];
      operations.forEach((operation, index) => {
        const previousOperations = operations.slice(0, index + 1);
        const currentInvestment = previousOperations.filter(o => o.type === 'investment').reduce((acc, cur) => acc + cur.amount, 0);

        const total = investmentWithInterest(payload.rate, previousOperations, payload.isComposite);

        const interests = total - currentInvestment;
        const invested = operation.type === 'investment' ? operation.amount : 0;
        const revenues = operation.type === 'income' ? operation.amount : 0;
        const periodInterests = index === 0 ? 0 : interests - results[index - 1].interests;
        const amountOwed = index === 0 ? invested : results[index - 1].amountOwed + invested - revenues;
        const interestOwed = index === 0 ? 0 : periodInterests + results[index - 1].interestOwed + (amountOwed < 0 ? amountOwed : 0);
        const item = {
          event: operation.type,
          invested,
          revenues,
          date: operation.date,
          amountOwed,
          periodDays: index === 0 ? 0 : differenceInDays(operation.date, results[index - 1].date),
          periodInterests,
          interests,
          interestOwed: interestOwed > 0 ? interestOwed : 0
        };
        results.push(item);
      });

      return results;
    })
  );

  constructor(
    private shell: DashboardWaterfallShellComponent,
  ) { }

}
