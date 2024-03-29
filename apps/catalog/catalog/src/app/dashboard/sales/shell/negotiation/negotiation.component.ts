import { Component, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SaleShellComponent } from '../shell.component';
import { NegotiationForm } from '@blockframes/contract/negotiation/form';
import { NegotiationService } from '@blockframes/contract/negotiation/service';
import { NegotiationGuardedComponent } from '@blockframes/contract/negotiation/guard'
import { ContractService } from '@blockframes/contract/contract/service';
import { OrganizationService } from '@blockframes/organization/service';
import { ConfirmDeclineComponent, ConfirmDeclineData } from '@blockframes/contract/contract/components/confirm-decline/confirm-decline.component';
import { ConfirmComponent } from '@blockframes/ui/confirm/confirm.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { filter, pluck } from 'rxjs/operators'
import { Negotiation } from '@blockframes/model';
import { createModalData } from '@blockframes/ui/global-modal/global-modal.component';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'sale-negotiation',
  templateUrl: './negotiation.component.html',
  styleUrls: ['./negotiation.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NegotiationComponent implements NegotiationGuardedComponent, OnInit {

  negotiation: Negotiation;
  centralOrgId = this.shell.centralOrgId;
  sale$ = this.shell.sale$;
  contractStatus = this.shell.contractStatus;
  activeOrgId = this.orgService.org.id;
  form = new NegotiationForm({ terms: [] });
  activeTerm?: number;

  constructor(
    private snackBar: MatSnackBar,
    private negotiationService: NegotiationService,
    private contractService: ContractService,
    private shell: SaleShellComponent,
    private orgService: OrganizationService,
    private dialog: MatDialog,
    private router: Router,
    private route: ActivatedRoute,
  ) { }

  async ngOnInit(): Promise<void> {
    this.negotiation = await firstValueFrom(this.sale$.pipe(
      pluck('negotiation'),
      filter(data => !!data),
    ));
    this.form.hardReset(this.negotiation);
    const termIndex = this.route.snapshot.queryParams.termIndex;
    this.activeTerm = termIndex ? parseInt(termIndex) : 0;
  }

  async decline() {
    this.form.markAsPristine(); // usefull to be able to route in the NegotiationGuard
    const sale = await firstValueFrom(this.sale$);
    const ref = this.dialog.open(ConfirmDeclineComponent, {
      data: createModalData<ConfirmDeclineData>({ type: 'seller', showAcceptTermsCheckbox: true }),
      autoFocus: false
    });
    const options = { params: { contractId: sale.id } };
    ref.afterClosed().subscribe(declineReason => {
      const id = sale.negotiation.id;
      const config = { duration: 6000 };
      if (typeof declineReason === 'string') {
        const update = { declineReason, status: 'declined' } as const;
        this.negotiationService.update(id, update, options);
        this.router.navigate(['..', 'view'], { relativeTo: this.route });
        this.snackBar.open(`Offer declined.`, null, config);
      }
    });
  }

  async submit() {
    const onConfirm = async () => {
      const sale = await firstValueFrom(this.sale$);
      const config = { duration: 6000 };
      await this.contractService.addNegotiation(sale.id, {
        ...sale.negotiation,
        ...this.form.value,
      });
      this.form.markAsPristine(); // usefull to be able to route in the NegotiationGuard
      this.snackBar.open('Your counter offer has been sent', null, config);
      this.router.navigate(['..', 'view'], { relativeTo: this.route });
    };
    this.dialog.open(ConfirmComponent, { 
      data: createModalData({
        onConfirm,
        title: 'Are you sure you wish to submit this contract?',
        question: 'Please verify if all the contract elements are convenient for you.',
        confirm: 'Yes, submit Contract',
        cancel: 'Come back & Verify Contract'
      }, 'small'),
      autoFocus: false
    });
  }
}
