import { getContractLastVersion } from '@blockframes/contract/version/+state/contract-version.model';
import { Router, ActivatedRouteSnapshot, CanActivate } from '@angular/router';
import { Injectable } from '@angular/core';
import { ContractQuery } from '@blockframes/contract';
import { RouterQuery } from '@datorama/akita-ng-router-store';

@Injectable({ providedIn: 'root' })
export class CatalogContractGuard implements CanActivate {

    constructor(private contractQuery: ContractQuery, private routerQuery: RouterQuery, private router: Router) { }

    async canActivate(next: ActivatedRouteSnapshot) {
        const { contractId } = next.params
        const contract = this.contractQuery.getValue().entities[contractId];
        const lastVersion = getContractLastVersion(contract)
        if (lastVersion.status === 'draft') {
            const splittedRoute = this.routerQuery.getValue().state.url.split('/');
            const newRoute = splittedRoute.splice(1, splittedRoute.length - 2).join('/');
            this.router.navigate([newRoute]);
        } else {
            return true
        }
    }
}