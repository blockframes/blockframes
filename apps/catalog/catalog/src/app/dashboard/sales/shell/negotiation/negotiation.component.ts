import { Component, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { SaleShellComponent } from '../shell.component';
import { NegotiationForm } from '@blockframes/contract/negotiation';
import { OrganizationQuery } from '@blockframes/organization/+state';
import { NegotiationGuardedComponent } from '@blockframes/contract/negotiation/guard'
import { filter, first, pluck } from 'rxjs/operators'
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDeclineComponent, ConfirmDeclineData } from '@blockframes/contract/contract/components/confirm-decline/confirm-decline.component';
import { NegotiationService } from '@blockframes/contract/negotiation/+state/negotiation.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ConfirmComponent } from '@blockframes/ui/confirm/confirm.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ContractService } from '@blockframes/contract/contract/+state';

@Component({
  selector: 'sale-negotiation',
  templateUrl: './negotiation.component.html',
  styleUrls: ['./negotiation.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NegotiationComponent implements NegotiationGuardedComponent, OnInit {

  centralOrgId = this.shell.centralOrgId;
  sale$ = this.shell.sale$;
  negotiation$ = this.sale$.pipe(pluck('negotiation'))
  contractStatus = this.shell.contractStatus;
  activeOrgId = this.query.getActiveId();
  form = new NegotiationForm({ terms: [] });
  activeTerm?: number;

  constructor(
    private snackBar: MatSnackBar,
    private negotiationService: NegotiationService,
    private contractService: ContractService,
    private shell: SaleShellComponent,
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
    const termIndex = this.route.snapshot.queryParams.termIndex;
    this.activeTerm = termIndex ? parseInt(termIndex) : 0;
  }

  async decline() {
    this.form.markAsPristine(); // usefull to be able to route in the NegotiationGuard
    const sale = await this.sale$.pipe(first()).toPromise();
    const data: ConfirmDeclineData = { type: 'seller' };
    const ref = this.dialog.open(ConfirmDeclineComponent, { data });
    const options = { params: { contractId: sale.id } };
    ref.afterClosed().subscribe(declineReason => {
      const id = sale.negotiation.id;
      if (typeof declineReason === 'string') {
        const update = { declineReason, status: 'declined' } as const;
        this.negotiationService.update(id, update, options);
        this.router.navigate(['..', 'view'], { relativeTo: this.route });
      }
    });
  }

  async confirm() {
    const onConfirm = async () => {
      const sale = await this.sale$.pipe(first()).toPromise();
      await this.contractService.addNegotiation(sale.id, {
        ...sale.negotiation,
        ...this.form.value,
      });
      this.form.markAsPristine(); // usefull to be able to route in the NegotiationGuard
      this.snackBar.open('Your counter offer has been sent');
      this.router.navigate(['..', 'view'], { relativeTo: this.route });
    };
    const data = {
      onConfirm,
      title: 'Are you sure to submit this contract?',
      question: 'Please verify if all the contract elements are convenient for you.',
      confirm: 'Yes, submit',
      cancel: 'Come back & verify contract'
    };
    this.dialog.open(ConfirmComponent, { data });
  }
}
