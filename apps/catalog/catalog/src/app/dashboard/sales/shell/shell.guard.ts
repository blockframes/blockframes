import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, Router } from '@angular/router';
import { AuthQuery } from '@blockframes/auth/+state';
import { ContractService } from '@blockframes/contract/contract/+state';

@Injectable({ providedIn: 'root' })
export class CatalogSaleShellGuard implements CanActivate {
  constructor(
    private router: Router,
    private authQuery: AuthQuery,
    private contractService: ContractService,
  ) { }

  async canActivate(route: ActivatedRouteSnapshot) {
    const saleId = route.paramMap.get('saleId');

    if (!saleId) this.router.parseUrl('c/o/dashboard/sales');

    const contract = await this.contractService.getValue(saleId);
    const isStakeholder = contract?.stakeholders.includes(this.authQuery.orgId);

    return isStakeholder
      ? true
      : this.router.parseUrl('c/o/dashboard/sales');
  }
}
