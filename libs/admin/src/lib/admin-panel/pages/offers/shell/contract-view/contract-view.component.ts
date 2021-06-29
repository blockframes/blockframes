
import { Component, ChangeDetectionStrategy, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormControl, FormGroup } from '@angular/forms';
import { AngularFirestore } from '@angular/fire/firestore';

import { map, pluck, switchMap } from 'rxjs/operators';
import { combineLatest, Observable, Subscription } from 'rxjs';

import { OfferShellComponent } from '../shell.component';
import { Term, TermService } from '@blockframes/contract/term/+state';
import { Contract, ContractService, contractStatus } from '@blockframes/contract/contract/+state';
import { OrganizationService } from '@blockframes/organization/+state';
import { IncomeService } from '@blockframes/contract/income/+state';



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

  private rawContract$ = combineLatest([
    this.contractId$,
    this.shell.contracts$,
  ]).pipe(
    map(([contractId, contracts]) => contracts.find(contract => contract.id === contractId)),
  );

  private terms$ = this.contractId$.pipe(
    switchMap(contractId => this.termService.valueChanges(ref => ref.where('contractId', '==', contractId))),
  );

  contract$ = combineLatest([
    this.rawContract$,
    this.terms$,
  ]).pipe(
    map(([ contract, terms]) => ({ ...contract, terms })),
  );


  income$ = combineLatest([
    this.contractId$,
    this.shell.incomes$,
  ]).pipe(
    map(([contractId, incomes]) => incomes.find(income => income.id === contractId)),
  );

  sellerOrg$ = this.rawContract$.pipe(
    switchMap(contract => this.orgService.valueChanges(contract.sellerId)),
  );


  form = new FormGroup({
    status: new FormControl('pending'),
    price: new FormControl(0),
  });

  private sub: Subscription;

  constructor(
    private db: AngularFirestore,
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

  delete(term: Term) {
    this.contractService.update(term.contractId, (contract, write) => {
      this.incomeService.remove(term.id, { write });
      return { termIds: contract.termIds.filter(id => id !== term.id) };
    })
  }
}
