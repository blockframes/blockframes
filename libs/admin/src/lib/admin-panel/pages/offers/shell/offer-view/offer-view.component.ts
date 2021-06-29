import {
  Component, ChangeDetectionStrategy, OnDestroy
} from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { combineLatest, Subscription } from 'rxjs';
import { map, shareReplay, startWith, tap } from 'rxjs/operators';
import { OfferShellComponent } from '../shell.component';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ConfirmInputComponent } from '@blockframes/ui/confirm-input/confirm-input.component';


const columns = {
  'sellerApproved': 'Seller Approved',
  'orgIds': 'Seller\'s name (Email)',
  'titleId': 'Title ID',
  'organizationName': 'Organization Name',
  'id': 'Actions',
};

@Component({
  selector: 'offer-view',
  templateUrl: './offer-view.component.html',
  styleUrls: ['./offer-view.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OfferViewComponent implements OnDestroy {

  public offer$ = this.shell.offer$.pipe(shareReplay(1));
  public buyerOrg$ = this.shell.buyerOrg$;
  public contracts$ = this.shell.contracts$;
  public incomes$ = this.shell.incomes$;
  public form = new FormGroup({
    select_type: new FormControl('general_contract_status'),
    buyers_specific_term: new FormControl(null),
    buyers_delivery_wishlist: new FormControl(null),
  })

  public deleteControl = new FormControl('');
  public deleteValid$ = this.deleteControl.valueChanges.pipe(
    map(_ => `${_}`.toLowerCase().trim() !== 'delete'),
    startWith(true)
  );
  public confirmDialog: MatDialogRef<unknown>;
  public hydratedContracts$ = combineLatest(
    this.buyerOrg$,
    this.contracts$,
    this.offer$,
  ).pipe(
    tap(
      ([buyerOrg, contracts, offer]) => {
        this.form.get('buyers_specific_term').setValue(offer.specificity)
        this.form.get('buyers_delivery_wishlist').setValue(offer.delivery)
      }
    ),
    map(
      ([buyerOrg, contracts]) => {
        return contracts.map(contract => ({
          sellerApproved: contract.status,
          orgIds: contract.stakeholders.filter(
            stakeholder => ![contract.buyerId, contract.sellerId].includes(stakeholder)
          ),
          titleId: contract.titleId,
          organizationName: buyerOrg.denomination.public,
          id: contract.id,
        }));
      }
    )
  )

  public titles: {
    sellerApproved
    orgIds
    organizationName
    id: string
  }[] = [];
  public columns = columns;
  public initialColumns = ['titleId', 'sellerApproved', 'orgIds', 'organizationName', 'id'];
  public subs: Subscription[] = [];

  constructor(
    private shell: OfferShellComponent,
    private dialog: MatDialog,
  ) { }


  update() {
    console.log('updating')
  }

  handleDelete(id: string) {
    console.log('deleting ' + id)
  }

  close() {
    this.confirmDialog.close()
  }

  confirmDelete(id: string) {
    this.confirmDialog = this.dialog.open(ConfirmInputComponent, {
      data: {
        title: 'Are you sure you want to delete a right from this package?',
        subtitle: '',
        confirmationWord: 'delete',
        placeholder: 'Please Type « DELETE »',
        confirm: 'Delete this right',
        confirmButtonText: 'Delete this right',
        cancel: 'Cancel',
        onConfirm: () => {
          this.handleDelete(id);
          this.confirmDialog.close();
        },
      },
      autoFocus: false,
    });
  }


  // delete(term: Term) {
  //   this.contractService.update(term.contractId, (contract, write) => {
  //     this.incomeService.remove(term.id, { write });
  //     return { termIds: contract.termIds.filter(id => id !== term.id) };
  //   })
  // }

  ngOnDestroy() {
    this.subs.forEach(_ => _.unsubscribe());
  }

}
