import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { CanActivate, ActivatedRouteSnapshot, Router, CanDeactivate } from '@angular/router';
import { ContractService } from '@blockframes/contract/contract/+state';
import { NegotiationForm } from '@blockframes/contract/negotiation';
import { OrganizationQuery } from '@blockframes/organization/+state';
import { ConfirmComponent } from '@blockframes/ui/confirm/confirm.component';
import { first } from 'rxjs/operators';

export type NegotiationGuardedComponent = {
  form: NegotiationForm
}

@Injectable({ providedIn: 'root' })
export class NegotiationGuard<T extends NegotiationGuardedComponent> implements CanActivate, CanDeactivate<T>{
  constructor(
    private router: Router,
    private contractService: ContractService,
    private orgQuery: OrganizationQuery,
    private dialog: MatDialog,
  ) { }

  async canActivate(route: ActivatedRouteSnapshot) {
    const saleId = route.paramMap.get('saleId');
    const activeOrgId = this.orgQuery.getActiveId();

    if (!saleId) this.router.parseUrl(`c/o/dashboard/sales`);

    const lastNegotiation = await this.contractService.lastNegotiation(saleId).pipe(first()).toPromise();
    const isNegotiationPending = lastNegotiation.status === 'pending'
    const notCreatorOrg = lastNegotiation.createdByOrg !== activeOrgId;

    return isNegotiationPending && notCreatorOrg
      ? true
      : this.router.parseUrl(`c/o/dashboard/sales/${saleId}/view`);
  }

  canDeactivate(component: T) {
    if (component.form.pristine) return true;
    const dialogRef = this.dialog.open(ConfirmComponent, {
      data: {
        title: `Are you sure you want to leave?`,
        question: `Check if you don't have unsaved changes.`,
        confirm: 'Leave anyway',
        cancel: 'Stay',
      },
      autoFocus: false,
    })
    return dialogRef.afterClosed();
  }
}
