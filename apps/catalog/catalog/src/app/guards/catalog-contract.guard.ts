import { getContractLastVersion } from '@blockframes/contract/version/+state/contract-version.model';
import { Router, ActivatedRouteSnapshot, CanActivate } from '@angular/router';
import { Injectable } from '@angular/core';
import { ContractStore } from '@blockframes/contract';

@Injectable({ providedIn: 'root' })
export class CatalogContractGuard implements CanActivate {

    constructor(private contractStore: ContractStore, private router: Router) { }

    async canActivate(next: ActivatedRouteSnapshot) {
        const contract = this.contractStore.getValue().entities[next.paramMap.get('contractId')];
        const lastVersion = getContractLastVersion(contract)
        return lastVersion.status === 'draft' ? this.router.parseUrl('c/o/dashboard/deals/list') : true;
    }
}