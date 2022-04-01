import { Component, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { OfferShellComponent } from '../shell.component';
import { filter, first, map, pluck } from 'rxjs/operators';
import { NegotiationGuardedComponent } from '@blockframes/contract/negotiation/guard';
import { NegotiationForm } from '@blockframes/contract/negotiation';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import {
  ConfirmDeclineComponent,
  ConfirmDeclineData,
} from '@blockframes/contract/contract/components/confirm-decline/confirm-decline.component';
import { NegotiationService } from '@blockframes/contract/negotiation/+state/negotiation.service';
import { OrganizationService } from '@blockframes/organization/+state';
import { ConfirmComponent } from '@blockframes/ui/confirm/confirm.component';
import { combineLatest } from 'rxjs';
import { ContractService } from '@blockframes/contract/contract/+state';
import { Negotiation } from '@blockframes/shared/model';

@Component({
  selector: 'catalog-contract-edit',
  templateUrl: './contract-edit.component.html',
  styleUrls: ['./contract-edit.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ContractEditComponent implements NegotiationGuardedComponent, OnInit {
  negotiation?: Negotiation;
  activeOrgId = this.orgService.org.id;
  activeTerm?: number;
  form = new NegotiationForm();
  sale$ = combineLatest([this.shell.offer$, this.route.params.pipe(pluck('saleId'))]).pipe(
    map(([offer, id]) => offer.contracts?.find(contract => contract.id === id))
  );
  negotiation$ = this.sale$.pipe(map(contract => contract?.negotiation));

  constructor(
    private snackBar: MatSnackBar,
    private shell: OfferShellComponent,
    private negotiationService: NegotiationService,
    private contractService: ContractService,
    private orgService: OrganizationService,
    private dialog: MatDialog,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  async ngOnInit(): Promise<void> {
    this.negotiation = await this.negotiation$
      .pipe(
        filter(data => !!data),
        first()
      )
      .toPromise();
    this.form.hardReset(this.negotiation);
    const termIndex = this.route.snapshot.queryParams.termIndex;
    this.activeTerm = termIndex ? parseInt(termIndex) : 0;
  }

  async decline() {
    const sale = await this.sale$.pipe(first()).toPromise();
    const data: ConfirmDeclineData = {
      type: 'buyer',
      showAcceptTermsCheckbox: true,
    };
    const ref = this.dialog.open(ConfirmDeclineComponent, { data });
    const options = { params: { contractId: sale.id } };
    ref.afterClosed().subscribe(declineReason => {
      if (typeof declineReason === 'string') {
        const id = sale.negotiation.id;
        const config = { duration: 6000 };
        const partialData = { declineReason, status: 'declined' } as const;
        this.negotiationService.update(id, partialData, options);
        this.form.markAsPristine(); // usefull to be able to route in the NegotiationGuard
        this.router.navigate(['..'], { relativeTo: this.route });
        this.snackBar.open(`Offer declined.`, null, config);
      }
    });
  }

  async confirm() {
    const onConfirm = async () => {
      const sale = await this.sale$.pipe(first()).toPromise();
      const config = { duration: 6000 };
      await this.contractService.addNegotiation(sale.id, {
        ...sale.negotiation,
        ...this.form.value,
      });
      this.snackBar.open('Your counter offer has been sent', null, config);
      this.form.markAsPristine(); // usefull to be able to route in the NegotiationGuard
      this.router.navigate(['..'], { relativeTo: this.route });
    };

    const data = {
      onConfirm,
      title: 'Are you sure to submit this contract?',
      question: 'Please verify if all the contract elements are convenient for you.',
      confirm: 'Yes, submit',
      cancel: 'Come back & verify contract',
    };
    this.dialog.open(ConfirmComponent, { data });
  }
}
