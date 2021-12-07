import { Component, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { OfferShellComponent } from '../shell.component';
import { filter, first, map, pluck, shareReplay, switchMap } from 'rxjs/operators';
import { NegotiationGuardedComponent } from '@blockframes/contract/negotiation/guard';
import { NegotiationForm } from '@blockframes/contract/negotiation';
import { ContractService } from '@blockframes/contract/contract/+state';
import { joinWith } from '@blockframes/utils/operators';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ConfirmDeclineComponent } from '@blockframes/contract/contract/components/confirm-decline/confirm-decline.component';
import { NegotiationService } from '@blockframes/contract/negotiation/+state/negotiation.service';
import { OrganizationQuery } from '@blockframes/organization/+state';
import { ConfirmComponent } from '@blockframes/ui/confirm/confirm.component';
import { combineLatest, Observable } from 'rxjs';

@Component({
  selector: 'catalog-contract-edit',
  templateUrl: './contract-edit.component.html',
  styleUrls: ['./contract-edit.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ContractEditComponent implements NegotiationGuardedComponent, OnInit {

  activeOrgId = this.query.getActiveId();
  form = new NegotiationForm();
  contracts$ = this.shell.offer$.pipe(
    map(offer => offer.contracts),
  );
  contractId$ = this.route.params.pipe(pluck('saleId'));
  sale$ = combineLatest([this.contracts$, this.contractId$]).pipe(
    map(([contracts, id]) => contracts.find(contract => contract.id === id))
  );
  negotiation$ = this.sale$.pipe(map(contract => contract.negotiation));

  constructor(
    private snackBar: MatSnackBar,
    private orgQuery: OrganizationQuery,
    private shell: OfferShellComponent,
    private contractService: ContractService,
    private negotiationService: NegotiationService,
    private query: OrganizationQuery,
    private dialog: MatDialog,
    private router: Router,
    private route: ActivatedRoute,
  ) { }

  async ngOnInit(): Promise<void> {
    const negotiation = await this.negotiation$.pipe(
      filter(data => !!data),
      first()
    ).toPromise();
    this.form.hardReset(negotiation);
  }

  async decline() {
    this.form.markAsPristine(); // usefull to be able to route in the NegotiationGuard
    const sale = await this.sale$.pipe(first()).toPromise();
    const ref = this.dialog.open(ConfirmDeclineComponent);
    const options = { params: { contractId: sale.id } };
    ref.afterClosed().subscribe(declineReason => {
      if (typeof declineReason === 'string') {
        this.negotiationService.update(
          sale.negotiation.id, { declineReason, status: 'declined' }, options
        )
        this.router.navigate(['..'], { relativeTo: this.route })
      }
    });
  }

  async confirm() {
    const onConfirm = async () => {
      const sale = await this.sale$.pipe(first()).toPromise();
      this.form.markAsPristine(); // usefull to be able to route in the NegotiationGuard
      await this.negotiationService.create(sale.id, {
        ...sale.negotiation,
        ...this.form.value,
        createdByOrg: this.activeOrgId,
      });
      this.snackBar.open('Your counter offer has been sent');
      this.router.navigate(['..'], { relativeTo: this.route });
    }

    this.dialog.open(
      ConfirmComponent,
      {
        data: {
          onConfirm,
          title: 'Are you sure to submit this contract?',
          question: 'Please verify if all the contract elements are convenient for you.',
          confirm: 'Yes, submit',
          cancel: 'Come back & verify contract'
        }
      });
  }

}
