import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, Router } from '@angular/router';
import { AuthQuery } from '@blockframes/auth/+state';
import { ContractService } from '@blockframes/contract/contract/+state';

@Injectable({ providedIn: 'root' })
export class CatalogContractViewGuard implements CanActivate {
  constructor(
    private router: Router,
    private authQuery: AuthQuery,
    private contractService: ContractService,
  ) { }

  async canActivate(route: ActivatedRouteSnapshot) {
    const contractId = route.paramMap.get('contractId');

    if (!contractId) this.router.parseUrl('c/o/dashboard/contracts');

    const contract = await this.contractService.getValue(contractId);
    const isStakeholder = contract?.stakeholders.includes(this.authQuery.orgId);

    return isStakeholder
      ? true
      : this.router.parseUrl('c/o/dashboard/contracts');
  }
}
