import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ConditionInterest, getRightCondition, interestDetail, rightholderGroups } from '@blockframes/model';
import { combineLatest, filter, map, switchMap } from 'rxjs';
import { DashboardWaterfallShellComponent } from '@blockframes/waterfall/dashboard/shell/shell.component';

@Component({
  selector: 'crm-document',
  templateUrl: './document.component.html',
  styleUrls: ['./document.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DocumentComponent {
  private documentId = this.route.snapshot.paramMap.get('documentId');

  public waterfall = this.shell.waterfall;
  public movie = this.shell.movie;

  public contract$ = this.shell.contractsAndTerms$.pipe(
    map(contracts => contracts.find(c => c.id === this.documentId)),
  );

  public financingPlan$ = this.shell.financingPlans$.pipe(
    map(plans => plans.find(plan => plan.id === this.documentId))
  );

  public budget$ = this.shell.budgets$.pipe(
    map(plans => plans.find(plan => plan.id === this.documentId))
  );

  public childContracts$ = this.contract$.pipe(
    filter(c => !c?.rootId),
    switchMap(c => this.shell.contractsAndTerms$.pipe(map(contracts => contracts.filter(contract => contract.rootId === c.id)))),
  );

  public rights$ = this.shell.rights$.pipe(
    map(rights => rights.filter(r => r.contractId === this.documentId))
  );

  public showExpenseTypes$ = this.contract$.pipe(
    map(contract => rightholderGroups.withStatements.includes(contract.type))
  );

  public interests$ = combineLatest([this.rights$, this.shell.state$, this.contract$]).pipe(
    map(([rights, state, contract]) => {
      const allConditions = rights.map(right => getRightCondition(right)).filter(condition => !!condition).flat();
      const interestCondition = allConditions.find(condition => condition.name === 'interest');
      if (!interestCondition) return;
      const payload = interestCondition.payload as ConditionInterest;
      return interestDetail(contract.id, payload, state.waterfall.state);
    })
  );

  constructor(
    private shell: DashboardWaterfallShellComponent,
    private route: ActivatedRoute
  ) { }

}