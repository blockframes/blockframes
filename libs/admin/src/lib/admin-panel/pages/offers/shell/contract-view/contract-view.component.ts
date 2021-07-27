
import { Component, ChangeDetectionStrategy, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { FormControl, FormGroup } from '@angular/forms';

import { map, pluck, switchMap } from 'rxjs/operators';
import { combineLatest, Observable, Subscription } from 'rxjs';

import { IncomeService } from '@blockframes/contract/income/+state';
import { Term, TermService } from '@blockframes/contract/term/+state';
import { OrganizationService } from '@blockframes/organization/+state';
import { ContractService, contractStatus, Holdback } from '@blockframes/contract/contract/+state';
import { ConfirmInputComponent } from '@blockframes/ui/confirm-input/confirm-input.component';

import { OfferShellComponent } from '../shell.component';


@Component({
  selector: 'contract-view',
  templateUrl: './contract-view.component.html',
  styleUrls: ['./contract-view.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ContractViewComponent implements OnInit, OnDestroy {

  status = contractStatus;

  offerId$ = this.shell.offerId$;
  contractId$: Observable<string> = this.route.params.pipe(pluck('contractId'));

  contract$ = combineLatest([
    this.contractId$,
    this.shell.contracts$,
  ]).pipe(
    map(([contractId, contracts]) => contracts.find(contract => contract.id === contractId)),
  );


  income$ = combineLatest([
    this.contractId$,
    this.shell.incomes$,
  ]).pipe(
    map(([contractId, incomes]) => incomes.find(income => income.id === contractId)),
  );

  sellerOrg$ = this.contract$.pipe(
    switchMap(contract => this.orgService.valueChanges(contract.sellerId)),
  );


  form = new FormGroup({
    status: new FormControl('pending'),
    price: new FormControl(0),
  });

  private sub: Subscription;

  constructor(
    private dialog: MatDialog,
    private route: ActivatedRoute,
    private termService: TermService,
    private shell: OfferShellComponent,
    private incomeService: IncomeService,
    private orgService: OrganizationService,
    private contractService: ContractService,
  ) {}

  ngOnInit() {
    this.sub = combineLatest([
      this.contract$,
      this.income$,
    ]).subscribe(([contract, income]) => {
      this.form.setValue({ status: contract.status, price: income.price });
    });
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }

  update(contractId: string, incomeId: string) {
    const write = this.contractService.batch();
    const { status, price} = this.form.value;
    this.contractService.update(contractId, { status }, { write });
    this.incomeService.update(incomeId, { price }, { write });
    write.commit();
  }

  updateHoldbacks(contractId: string, holdbacks: Holdback[]) {
    this.contractService.update(contractId, { holdbacks });
  }

  confirm(term: Term) {
    this.dialog.open(ConfirmInputComponent, {
      data: {
        title: 'Are you sure ?',
        subtitle: `You are about to delete permanently this term (#${term.id}). This action will also update the contract #${term.contractId} to remove the reference to the deleted term.`,
        text: `Please type "DELETE" to confirm.`,
        confirmationWord: 'DELETE',
        confirmButtonText: 'Delete term',
        onConfirm: this.delete(term),
      }
    });
  }

  delete(term: Term) {
    this.contractService.update(term.contractId, (contract, write) => {
      this.incomeService.remove(term.id, { write });
      return { termIds: contract.termIds.filter(id => id !== term.id) };
    })
  }
}
