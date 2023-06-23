import { Component, ChangeDetectionStrategy, OnDestroy, OnInit } from '@angular/core';
import { UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { Subscription } from 'rxjs';
import { OfferShellComponent } from '../shell.component';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmInputComponent } from '@blockframes/ui/confirm-input/confirm-input.component';
import { ContractService } from '@blockframes/contract/contract/service';
import { OfferService } from '@blockframes/contract/offer/service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NegotiationService } from '@blockframes/contract/negotiation/service';
import { Contract, staticModel } from '@blockframes/model';
import { createModalData } from '@blockframes/ui/global-modal/global-modal.component';

@Component({
  selector: 'offer-view',
  templateUrl: './offer-view.component.html',
  styleUrls: ['./offer-view.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OfferViewComponent implements OnDestroy, OnInit {

  public offer$ = this.shell.offer$;
  public offerStatus = Object.keys(staticModel['offerStatus']);
  public form = new UntypedFormGroup({
    status: new UntypedFormControl('pending'),
    specificity: new UntypedFormControl('')
  })
  subscription: Subscription;

  constructor(
    private shell: OfferShellComponent,
    private dialog: MatDialog,
    private offerService: OfferService,
    private contractService: ContractService,
    private snackbar: MatSnackBar,
    private negotiationService: NegotiationService
  ) { }

  ngOnInit() {
    this.subscription = this.offer$.subscribe(({ status, specificity }) => {
      this.form.patchValue({ status, specificity });
    });
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  async update(offerId: string, contracts: Contract[]) {
    const { status, specificity } = this.form.value;
    const updateOffer = async () => {
      const sale = { specificity } as const;
      const write = this.offerService.batch();
      await this.offerService.update(offerId, { specificity, status }, { write });
      const updateContract = contract => this.contractService.update(contract.id, sale, { write });
      const updateNegotiation = (contract) => {
        const config = { write, params: { contractId: contract.id } };
        return this.negotiationService.update(contract.negotiation?.id, sale, config);
      }
      await Promise.all([
        ...contracts.map(updateContract),
        ...contracts.map(updateNegotiation)
      ]);

      await write.commit();
      this.snackbar.open('Updated', '', { duration: 1000 });
    }
    if (["signing", "signed"].includes(status)) updateOffer()
    else this.confirmStatusUpdate(updateOffer)
  }

  confirmStatusUpdate(onConfirm: () => void) {
    this.dialog.open(ConfirmInputComponent, {
      data: createModalData({
        title: 'Are you sure you want to update this offer?',
        subtitle: 'The modification that you bring can impact this offer and all the contracts that are inside. Please make sure that you are aware of these modifications.',
        confirmationWord: 'update',
        placeholder: 'To confirm the update, please write « UPDATE » in the field below.',
        confirm: 'Confirm and update',
        confirmButtonText: 'Confirm and update',
        cancel: 'Cancel',
        onConfirm
      }),
      autoFocus: true
    });

  }

  confirmDelete(id: string) {
    this.dialog.open(ConfirmInputComponent, {
      data: createModalData({
        title: 'Are you sure you want to delete a right from this package?',
        subtitle: 'This action can\'t be undone. Before we delete this right please write “DELETE” in the field below.',
        confirmationWord: 'delete',
        placeholder: 'Please Type « DELETE »',
        confirm: 'Delete this right',
        confirmButtonText: 'Delete this right',
        cancel: 'Cancel',
        onConfirm: () => this.contractService.remove(id)
      }),
      autoFocus: false
    });
  }

}
