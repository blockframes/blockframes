import { Component, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { OfferShellComponent } from '../shell.component';
import { combineLatest, firstValueFrom } from 'rxjs';
import { map, pluck } from 'rxjs/operators';
import { OrganizationService } from '@blockframes/organization/service';
import { ConfirmWithValidationComponent } from '@blockframes/contract/contract/components/confirm-with-validation/confirm-with-validation.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { NegotiationService } from '@blockframes/contract/negotiation/service';
import { createModalData } from '@blockframes/ui/global-modal/global-modal.component';

@Component({
  selector: 'catalog-contract-view',
  templateUrl: './contract-view.component.html',
  styleUrls: ['./contract-view.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ContractViewComponent {
  activeOrgId = this.orgService.org.id;

  contracts$ = this.shell.offer$.pipe(
    map(offer => [...(offer.contracts??[]), ...(offer.declinedContracts??[])])
  );

  contract$ = combineLatest([
    this.contracts$,
    this.route.params.pipe(pluck('contractId'))
  ]).pipe(
    map(([contracts, id]) => contracts.find(contract => contract.id === id)),
  );

  constructor(
    private route: ActivatedRoute,
    private shell: OfferShellComponent,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    private orgService: OrganizationService,
    private negotiationService: NegotiationService,
  ) { }

  async accept() {
    const onConfirm = async () => {
      const sale = await firstValueFrom(this.contract$);
      this.negotiationService.update(
        sale.negotiation.id, { status: 'accepted' }, { params: { contractId: sale.id } }
      );
      const config = { duration: 6000 };
      this.snackBar.open(`You accepted contract for ${sale.title.title.international}`, null, config);
    }
    this.dialog.open(ConfirmWithValidationComponent, {
      data: createModalData({
        onConfirm,
        title: 'Are you sure you wish to accept this contract?',
        question: 'Please verify if all the contract elements are convenient for you.',
        confirm: 'Yes, accept Contract',
        cancel: 'Come back & Verify Contract'
      }),
      autoFocus: false
    });
  }
}
