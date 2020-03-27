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
    if (contract.lastVersion.status === 'draft') {
      // split the route to work with array functions
      const splittedRoute = this.routerQuery.getValue().state.url.split('/');
      // remove the leading slash and remove the contractId
      const newRoute = splittedRoute.splice(1, splittedRoute.length - 2).join('/');
      this.router.navigate([newRoute]);
    } else {
      return true
    }
  }
}
