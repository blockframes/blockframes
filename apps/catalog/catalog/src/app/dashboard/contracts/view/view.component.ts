import {
  Component, ChangeDetectionStrategy, OnDestroy, OnInit, Optional
} from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { BehaviorSubject, Subscription } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmInputComponent } from '@blockframes/ui/confirm-input/confirm-input.component';
import { Contract, ContractService, ContractStatus, createSale, Sale } from '@blockframes/contract/contract/+state';
import { Offer, OfferService, offerStatus } from '@blockframes/contract/offer/+state';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { pluck, switchMap } from 'rxjs/operators';
import { Intercom } from 'ng-intercom';

@Component({
  selector: 'catalog-contract-view',
  templateUrl: './view.component.html',
  styleUrls: ['./view.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CatalogContractViewComponent implements OnDestroy, OnInit {

  offer$ = this.route.params.pipe(
    pluck('offerId'),
    switchMap((id: string) => this.offerService.valueChanges(id))
  );
  contract$ = this.route.params.pipe(
    pluck('contractId'),
    switchMap((id: string) => this.contractService.valueChanges(id))
  );
  loading$ = new BehaviorSubject<boolean>(false);
  public offerStatus = offerStatus;
  public form = new FormGroup({
    status: new FormControl('pending'),
    specificity: new FormControl(''),
    delivery: new FormControl(''),
  })
  subscription: Subscription;

  public columns = {
    'status': 'Seller Approved',
    'stakeholders': 'Seller\'s name (Email)',
    'titleId': 'Movie ID',
    'buyerId': 'Organization Name',
    'id': 'Actions',
  };
  public initialColumns = [
    'titleId', 'status', 'stakeholders', 'buyerId', 'id'
  ];

  constructor(
    private dialog: MatDialog,
    private offerService: OfferService,
    private contractService: ContractService,
    private router: Router,
    private route: ActivatedRoute,
    private snackbar: MatSnackBar,
    @Optional() private intercom: Intercom,
  ) { }

  update(contracts: Contract[], id: string) {
    const { status, specificity, delivery } = this.form.value;

    this.offerService.update(id, (offer, write) => {
      contracts.forEach(contract =>
        this.contractService.update(contract.id, { specificity } as Sale, { write })
      );
      return { specificity, status, delivery };
    });
  }

  handleDelete(id: string) {
    this.contractService.remove(id)
  }


  confirmDelete(id: string) {
    this.dialog.open(ConfirmInputComponent, {
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
        },
      },
      autoFocus: false,
    });
  }

  async addTitle(offer: Offer) {
    const { buyerId, buyerUserId, specificity, id } = offer;
    const contractId = this.contractService.createId();
    const contract = createSale({ specificity, id: contractId, buyerId, offerId: id, buyerUserId, })
    this.loading$.next(true);
    try {
      await this.contractService.add(contract);
      this.router.navigate([`../`, contractId, 'form'], { relativeTo: this.route });
    } catch (err) {
      console.warn(err);
      this.snackbar.open("There was an error, please try later", 'close', { duration: 5000 });
    }
    this.loading$.next(false);
  }

  changeStatus(status: ContractStatus, id: string) {
    this.loading$.next(true);
    this.contractService.update(id, () => {
      return { status };
    })
      .finally(() => this.loading$.next(false))
      .catch((err) => {
        console.warn(err)
        this.snackbar.open(`There was an error, please try again later`, '', { duration: 4000 })
      })
  }

  declineContract(id: string) {
    this.changeStatus('declined', id);
  }

  acceptContract(id: string) {
    this.changeStatus('accepted', id);
  }

  ngOnInit() {
    this.subscription = this.offer$.subscribe(
      ({ status, specificity, delivery, }) => this.form.patchValue({ status, specificity, delivery })
    );
  }

  public openIntercom(): void {
    return this.intercom.show();
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
