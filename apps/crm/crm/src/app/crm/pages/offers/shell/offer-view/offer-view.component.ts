import { Component, ChangeDetectionStrategy, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { BehaviorSubject, Subscription } from 'rxjs';
import { OfferShellComponent } from '../shell.component';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmInputComponent } from '@blockframes/ui/confirm-input/confirm-input.component';
import { Contract, ContractService, Sale } from '@blockframes/contract/contract/+state';
import { OfferService } from '@blockframes/contract/offer/+state';
import { staticModel } from '@blockframes/utils/static-model';
import { IncomeService } from '@blockframes/contract/income/+state';
import { TermService } from '@blockframes/contract/term/+state';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'offer-view',
  templateUrl: './offer-view.component.html',
  styleUrls: ['./offer-view.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OfferViewComponent implements OnDestroy, OnInit {

  public offer$ = this.shell.offer$;
  public loading$ = new BehaviorSubject<boolean>(false);
  public offerStatus = Object.keys(staticModel['offerStatus']);
  public form = new FormGroup({
    status: new FormControl('pending'),
    specificity: new FormControl(''),
    delivery: new FormControl(''),
  })
  subscription: Subscription;

  constructor(
    private shell: OfferShellComponent,
    private dialog: MatDialog,
    private offerService: OfferService,
    private contractService: ContractService,
    private incomeService: IncomeService,
    private termService: TermService,
    private snackbar: MatSnackBar
  ) { }

  ngOnInit() {
    this.subscription = this.offer$.subscribe(({ status, specificity, delivery, }) => {
      this.form.patchValue({ status, specificity, delivery })
    });
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  private async handleDelete(id: string) {
    this.contractService.runTransaction(async write => {
      const snap = await write.get(this.contractService.getRef(id));
      const contract = snap.data() as Contract;
      return Promise.all([
        this.termService.remove(contract.termIds, { write }),
        this.incomeService.remove(id, { write }),
        this.contractService.remove(id, { write }),
      ]);
    });
  }

  async update(offerId: string, contracts: Contract[]) {
    const { status, specificity, delivery } = this.form.value;
    const sale = { specificity } as Sale;
    const write = this.offerService.batch();
    await this.offerService.update(offerId, { specificity, status, delivery }, { write });
    const updateContract = contract => this.contractService.update(contract.id, sale, { write });
    await Promise.all(contracts.map(updateContract));
    await write.commit();
    this.snackbar.open('Updated', '', { duration: 1000 });
  }

  confirmDelete(id: string) {
    this.dialog.open(ConfirmInputComponent, {
      data: {
        title: 'Are you sure you want to delete a right from this package?',
        subtitle: 'This action can’t be undone. Before we delete this right please write “DELETE” in the field below.',
        confirmationWord: 'delete',
        placeholder: 'Please Type « DELETE »',
        confirm: 'Delete this right',
        confirmButtonText: 'Delete this right',
        cancel: 'Cancel',
        onConfirm: () => this.handleDelete(id),
      },
      autoFocus: false,
    });
  }

}
