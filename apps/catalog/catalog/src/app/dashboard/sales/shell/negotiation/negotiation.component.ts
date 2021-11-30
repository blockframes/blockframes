import { Component, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { SaleShellComponent } from '../shell.component';
import { NegotiationForm } from '@blockframes/contract/negotiation';
import { OrganizationQuery } from '@blockframes/organization/+state';
import { NegotiationGuardedComponent } from './negotiation.guard'
import { filter, first, pluck } from 'rxjs/operators'
import { MatDialog } from '@angular/material/dialog';
import { Negotiation } from '@blockframes/contract/negotiation/+state/negotiation.firestore';
import { ConfirmDeclineComponent } from '@blockframes/contract/contract/components/confirm-decline/confirm-decline.component';
import { NegotiationService } from '@blockframes/contract/negotiation/+state/negotiation.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ConfirmComponent } from '@blockframes/ui/confirm/confirm.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { createDocumentMeta } from '@blockframes/utils/models-meta';

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
  form = new NegotiationForm()
  isSafeToReroute = false; //used in NegotiationGuard

  constructor(
    private snackBar: MatSnackBar,
    private orgQuery: OrganizationQuery,
    private negotiationService: NegotiationService,
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
    ).toPromise()
    this.form.hardReset(negotiation)
  }

  async decline() {
    this.isSafeToReroute = true;
    const sale = await this.sale$.pipe(first()).toPromise()
    const ref = this.dialog.open(ConfirmDeclineComponent)
    const options = { params: { contractId: sale.id } }
    ref.afterClosed().subscribe(declineReason => {
      if (typeof declineReason === 'string') {
        this.negotiationService.update(
          sale.negotiation.id, { declineReason, status: 'pending' }, options
        )
        this.router.navigate(['./..', 'view'], { relativeTo: this.route })
      }
    })
  }

  async confirm() {
    const onConfirm = async () => {
      const sale = await this.sale$.pipe(first()).toPromise()
      const formData = this.form.value
      const newTerm: Negotiation = {
        ...sale.negotiation,
        _meta: createDocumentMeta(),
        id:this.negotiationService.createId(),
        terms: formData.terms.map(term => ({
          ...term.avails,
          languages: term.versions
        })),
        status: 'pending',
        createdByOrg: this.orgQuery.getActiveId(),
      }
      const options = { params: { contractId: sale.id } }
      this.isSafeToReroute = true;
      await this.negotiationService.add(newTerm, options)
      this.snackBar.open('Your counter offer has been sent')
      this.router.navigate(['./..', 'view'], { relativeTo: this.route })
    }

    this.dialog.open(
      ConfirmComponent,
      {
        data: {
          onConfirm,
          title: 'Are you sure to submit this contract?',
          question: 'Please verify if all the contract elements are convenient for you.Please verify if all the contract elements are convenient for you.',
          confirm: 'Yes, submit',
          cancel: 'Come back & verify contract'
        }
      })
  }
}
