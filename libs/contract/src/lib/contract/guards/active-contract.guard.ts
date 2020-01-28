import { Injectable } from '@angular/core';
import { CollectionGuard, CollectionGuardConfig } from 'akita-ng-fire';
import { ActivatedRouteSnapshot } from '@angular/router';
import { ContractService } from '../+state/contract.service';
import { ContractState, ContractStore } from '../+state/contract.store';
import { tap } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
@CollectionGuardConfig({ awaitSync: true })
export class ActiveContractGuard extends CollectionGuard<ContractState> {
  constructor(protected service: ContractService, private store: ContractStore) {
    super(service);
  }

  /**
   * Sync and set active.
   * Use it on a route with :contractId in it.
   */
  sync({ params }: ActivatedRouteSnapshot) {
    return this.service.syncContractQuery(params.contractId).pipe(
      tap(_ => this.store.setActive(params.contractId))
    );
  }
}
