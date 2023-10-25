import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { Scope, Term, WaterfallContract, getDeclaredAmount } from '@blockframes/model';
import { createModalData } from '@blockframes/ui/global-modal/global-modal.component';
import { DetailedGroupComponent } from '@blockframes/ui/detail-modal/detailed.component';
import { filter, map, switchMap } from 'rxjs';
import { DashboardWaterfallShellComponent } from '@blockframes/waterfall/dashboard/shell/shell.component';

@Component({
  selector: 'crm-document',
  templateUrl: './document.component.html',
  styleUrls: ['./document.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DocumentComponent {
  private contractId = this.route.snapshot.paramMap.get('documentId');

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

  constructor(
    private shell: DashboardWaterfallShellComponent,
    private route: ActivatedRoute,
    private dialog: MatDialog,
  ) { }

  public openDetails(items: string[], scope: Scope) {
    this.dialog.open(DetailedGroupComponent, { data: createModalData({ items, scope }), autoFocus: false });
  }

  public getRightholderName(id: string) {
    if (!id) return '--';
    return this.shell.waterfall.rightholders.find(r => r.id === id)?.name || '--';
  }

  public getDeclaredAmount(contract: WaterfallContract & { terms: Term[] }) {
    return getDeclaredAmount(contract);
  }

  public getTermAmount(term: Term) {
    return { [term.currency]: term.price };
  }
}