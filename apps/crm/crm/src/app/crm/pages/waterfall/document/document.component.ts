import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { ConditionInterest, Scope, Term, WaterfallContract, getDeclaredAmount, getRightCondition, interestDetail, rightholderGroups } from '@blockframes/model';
import { createModalData } from '@blockframes/ui/global-modal/global-modal.component';
import { DetailedGroupComponent } from '@blockframes/ui/detail-modal/detailed.component';
import { combineLatest, filter, map, switchMap } from 'rxjs';
import { DashboardWaterfallShellComponent } from '@blockframes/waterfall/dashboard/shell/shell.component';

@Component({
  selector: 'crm-document',
  templateUrl: './document.component.html',
  styleUrls: ['./document.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DocumentComponent {
  private contractId = this.route.snapshot.paramMap.get('documentId');

  public waterfall = this.shell.waterfall;

  public contract$ = this.shell.contractsAndTerms$.pipe(
    map(contracts => contracts.find(c => c.id === this.contractId)),
  );

  public rootContract$ = this.contract$.pipe(
    filter(c => !!c?.rootId),
    switchMap(c => this.shell.contractsAndTerms$.pipe(map(contracts => contracts.find(contract => contract.id === c.rootId)))),
  );

  public childContracts$ = this.contract$.pipe(
    filter(c => !c?.rootId),
    switchMap(c => this.shell.contractsAndTerms$.pipe(map(contracts => contracts.filter(contract => contract.rootId === c.id)))),
  );

  public rights$ = this.shell.rights$.pipe(
    map(rights => rights.filter(r => r.contractId === this.contractId))
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
    private route: ActivatedRoute,
    private dialog: MatDialog,
  ) { }

  public openDetails(items: string[], scope: Scope) {
    this.dialog.open(DetailedGroupComponent, { data: createModalData({ items, scope }), autoFocus: false });
  }

  public getDeclaredAmount(contract: WaterfallContract & { terms: Term[] }) {
    return getDeclaredAmount(contract);
  }

  public getTermAmount(term: Term) {
    return { [term.currency]: term.price };
  }
}