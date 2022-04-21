import { Component, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { OfferShellComponent } from '../shell.component';
import { combineLatest } from 'rxjs';
import { first, map, pluck } from 'rxjs/operators';
import { OrganizationService } from '@blockframes/organization/+state';
import { ConfirmWithValidationComponent } from '@blockframes/contract/contract/components/confirm-with-validation/confirm-with-validation.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { NegotiationService } from '@blockframes/contract/negotiation/+state/negotiation.service';

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
      const sale = await this.contract$.pipe(first()).toPromise();
      this.negotiationService.update(
        sale.negotiation.id, { status: 'accepted' }, { params: { contractId: sale.id } }
      );
      const config = { duration: 6000 };
      this.snackBar.open(`You accepted contract for ${sale.title.title.international}`, null, config);
    }

    const data = {
      onConfirm,
      title: 'Are you sure you wish to accept this contract?',
      question: 'Please verify if all the contract elements are convenient for you.',
      confirm: 'Yes, accept Contract',
      cancel: 'Come back & Verify Contract'
    };
    this.dialog.open(ConfirmWithValidationComponent, { data });
  }
}
