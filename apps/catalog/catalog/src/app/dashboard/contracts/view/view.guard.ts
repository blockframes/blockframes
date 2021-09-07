import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, Router } from '@angular/router';
import { AuthQuery } from '@blockframes/auth/+state';
import { ContractService, Mandate, Sale } from '@blockframes/contract/contract/+state';

@Injectable({ providedIn: 'root' })
export class CatalogContractViewGuard implements CanActivate {
  constructor(
    private router: Router,
    private authQuery: AuthQuery,
    private contractService: ContractService,
  ) { }

  async canActivate(route: ActivatedRouteSnapshot) {
    const { contractId } = route.params;

    const contract = await this.contractService.getValue(contractId) as unknown as Sale | Mandate;
    const isStakeholder = contract.stakeholders.includes(this.authQuery.orgId);

    return isStakeholder
      ? true
      : this.router.parseUrl('c/o/dashboard/contracts');
  }
}
