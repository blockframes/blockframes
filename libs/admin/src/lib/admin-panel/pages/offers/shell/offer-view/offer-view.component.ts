import {
  Component, ChangeDetectionStrategy
} from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { combineLatest } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { OfferShellComponent } from '../shell.component';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ConfirmInputComponent } from '@blockframes/ui/confirm-input/confirm-input.component';
import { Contract, ContractService, Sale } from '@blockframes/contract/contract/+state';
import { Offer, OfferService, offerStatus } from '@blockframes/contract/offer/+state';


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
export class OfferViewComponent {

  public offer$ = this.shell.offer$;
  public buyerOrg$ = this.shell.buyerOrg$;
  public contracts$ = this.shell.contracts$;
  public incomes$ = this.shell.incomes$;
  public offerStatus = offerStatus;
  private offer: Offer;
  private contracts: Contract[];
  public form = new FormGroup({
    offerStatus: new FormControl(null),
    buyersSpecificTerm: new FormControl(null),
    buyersDeliveryWishlist: new FormControl(null),
  })

  public confirmDialog: MatDialogRef<unknown>;
  public hydratedContracts$ = combineLatest(
    this.buyerOrg$,
    this.contracts$,
    this.offer$,
    this.incomes$
  ).pipe(
    tap(
      ([buyerOrg, contracts, offer]) => {
        console.log({ contracts, offer })
        this.contracts = contracts
        this.offer = offer
        this.form.get('offerStatus').setValue(offer.status)
        this.form.get('buyersSpecificTerm').setValue(offer.specificity)
        this.form.get('buyersDeliveryWishlist').setValue(offer.delivery)
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
  public initialColumns = [
    'titleId', 'sellerApproved', 'orgIds', 'organizationName', 'id'
  ];

  constructor(
    private shell: OfferShellComponent,
    private dialog: MatDialog,
    private offerService: OfferService,
    private contractService: ContractService,

  ) { }

  update() {
    const { offerStatus,
      buyersSpecificTerm,
      buyersDeliveryWishlist } = this.form.value

    this.offerService.runTransaction(write => {
      const promises = []
      const offerPromise = this.offerService.update(
        {
          id: this.offer.id,
          specificity: buyersSpecificTerm,
          status: offerStatus,
          delivery: buyersDeliveryWishlist,
        }, { write });
      this.contracts.forEach(contract => {
        const contractPromise = this.contractService.update(
          { id: contract.id, specificity: buyersSpecificTerm, } as Sale, { write }
        );
        promises.push(contractPromise);
      })


      promises.push(offerPromise)
      return Promise.all(promises)
    })

  }

  handleDelete(id: string) {
    this.contractService.remove(id)
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
}
