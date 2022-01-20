import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { CanActivate, ActivatedRouteSnapshot, Router, CanDeactivate } from '@angular/router';
import { ContractService } from '@blockframes/contract/contract/+state';
import { NegotiationForm } from '@blockframes/contract/negotiation';
import { OrganizationService } from '@blockframes/organization/+state';
import { ConfirmComponent } from '@blockframes/ui/confirm/confirm.component';
import { first } from 'rxjs/operators';

export type NegotiationGuardedComponent = {
  form: NegotiationForm,
}

@Injectable({ providedIn: 'root' })
export class NegotiationGuard<T extends NegotiationGuardedComponent> implements CanActivate, CanDeactivate<T>{

  constructor(
    private router: Router,
    private contractService: ContractService,
    private orgService: OrganizationService,
    private dialog: MatDialog,
  ) { }

  async canActivate(route: ActivatedRouteSnapshot) {
    const saleId = route.paramMap.get('saleId');
    const activeOrgId = this.orgService.org.id;

    if (!saleId) return this.router.parseUrl(`c/o/dashboard/sales`);

    const negotiation = await this.contractService.lastNegotiation(saleId).pipe(first()).toPromise();
    if (!negotiation) return this.router.parseUrl(`c/o/dashboard/sales`);
    const isPending = negotiation.status === 'pending'
    const canNegotiate = negotiation.createdByOrg !== activeOrgId;

    if (isPending && canNegotiate) return true
    return this.router.parseUrl(`c/o/dashboard/sales/${saleId}/view`);
  }

  canDeactivate(component: T) {
    if (component.form.pristine ) return true;
    const dialogRef = this.dialog.open(ConfirmComponent, {
      data: {
        title: `Leave Page?`,
        question: `Please pay attention that unless you submit an offer the changes remain not saved.`,
        cancel: 'Come back & Submit Offer',
        confirm: 'Leave anyway',
      },
      autoFocus: false,
    });
    return dialogRef.afterClosed();
  }
}
