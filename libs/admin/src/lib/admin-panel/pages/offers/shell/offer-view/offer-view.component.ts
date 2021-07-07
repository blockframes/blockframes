import {
  Component, ChangeDetectionStrategy, OnDestroy, OnInit
} from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { BehaviorSubject, Subscription } from 'rxjs';
import { OfferShellComponent } from '../shell.component';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmInputComponent } from '@blockframes/ui/confirm-input/confirm-input.component';
import { Contract, ContractService, createSale, Sale } from '@blockframes/contract/contract/+state';
import { Offer, OfferService, offerStatus } from '@blockframes/contract/offer/+state';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'offer-view',
  templateUrl: './offer-view.component.html',
  styleUrls: ['./offer-view.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OfferViewComponent implements OnDestroy, OnInit {

  public offer$ = this.shell.offer$;
  public buyerOrg$ = this.shell.buyerOrg$;
  public contracts$ = this.shell.contracts$;
  public loading$ = new BehaviorSubject<boolean>(false);
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
    private shell: OfferShellComponent,
    private dialog: MatDialog,
    private offerService: OfferService,
    private contractService: ContractService,
    private router: Router,
    private route: ActivatedRoute,
    private snackbar: MatSnackBar,
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

  ngOnInit() {
    this.subscription = this.offer$.subscribe(
      ({ status, specificity, delivery, }) => this.form.patchValue({ status, specificity, delivery })
    );
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
