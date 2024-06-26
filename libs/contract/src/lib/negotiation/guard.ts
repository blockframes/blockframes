import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRouteSnapshot, Router } from '@angular/router';
import { ContractService } from '../contract/service';
import { NegotiationForm } from '../negotiation';
import { OrganizationService } from '@blockframes/organization/service';
import { ConfirmComponent } from '@blockframes/ui/confirm/confirm.component';
import { createModalData } from '@blockframes/ui/global-modal/global-modal.component';
import { firstValueFrom } from 'rxjs';

export type NegotiationGuardedComponent = {
  form: NegotiationForm,
}

@Injectable({ providedIn: 'root' })
export class NegotiationGuard<T extends NegotiationGuardedComponent> {

  constructor(
    private router: Router,
    private contractService: ContractService,
    private orgService: OrganizationService,
    private dialog: MatDialog,
  ) { }

  async canActivate(next: ActivatedRouteSnapshot) {
    const saleId = next.paramMap.get('saleId');
    const activeOrgId = this.orgService.org.id;

    if (!saleId) return this.router.parseUrl(`c/o/dashboard/sales`);

    const negotiation = await firstValueFrom(this.contractService.lastNegotiation(saleId));
    if (!negotiation) return this.router.parseUrl(`c/o/dashboard/sales`);
    const isPending = negotiation.status === 'pending'
    const canNegotiate = negotiation.createdByOrg !== activeOrgId;

    if (isPending && canNegotiate) return true
    return this.router.parseUrl(`c/o/dashboard/sales/${saleId}/view`);
  }

  canDeactivate(component: T) {
    if (component.form.pristine) return true;
    const dialogRef = this.dialog.open(ConfirmComponent, {
      data: createModalData({
        title: `Leave Page?`,
        question: `Please pay attention that unless you submit an offer the changes remain not saved.`,
        cancel: 'Come back & Submit Offer',
        confirm: 'Leave anyway'
      }, 'small'),
      autoFocus: false
    });
    return dialogRef.afterClosed();
  }
}
