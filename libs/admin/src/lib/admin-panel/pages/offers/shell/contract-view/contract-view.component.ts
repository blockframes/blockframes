
import { Component, ChangeDetectionStrategy, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { combineLatest, Observable, Subscription } from 'rxjs';
import { map, pluck, switchMap } from 'rxjs/operators';

import { OfferShellComponent } from '../shell.component';
import { Term, TermService } from '@blockframes/contract/term/+state';
import { Contract, contractStatus } from '@blockframes/contract/contract/+state';
import { OrganizationService } from '@blockframes/organization/+state';

import { CRMContractViewForm } from './contract-view.form';
import { AngularFirestore } from '@angular/fire/firestore';

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


  form = new CRMContractViewForm();

  private sub: Subscription;

  constructor(
    private db: AngularFirestore,
    private route: ActivatedRoute,
    private termService: TermService,
    private shell: OfferShellComponent,
    private orgService: OrganizationService,
  ) {}

  ngOnInit() {
    this.sub = combineLatest([
      this.contract$,
      this.income$,
    ]).subscribe(([contract, income]) => {
      this.form.patchAllValue({ status: contract.status, price: income.price });
    });
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }

  update(contractId: string, incomeId: string) {
    const batch = this.db.firestore.batch();

    const contractRef = this.db.firestore.doc(`contracts/${contractId}`);
    const incomeRef = this.db.firestore.doc(`incomes/${incomeId}`);

    const { status, price} = this.form.value;

    batch.update(contractRef, { status });
    batch.update(incomeRef, { price });

    batch.commit();
  }

  delete(term: Term) {
    this.db.firestore.runTransaction(async tx => {
      const contractRef = this.db.firestore.doc(`contracts/${term.contractId}`);
      const termRef = this.db.firestore.doc(`terms/${term.id}`);


      const contractSnap = await tx.get(contractRef);
      const { termIds } = contractSnap.data() as Contract;

      tx.update(contractRef, { termIds: termIds.filter(tid => tid !== term.id) });
      tx.delete(termRef);

      return tx;
    });
  }
}
