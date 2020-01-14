import { Injectable } from "@angular/core";
import { CollectionGuard, CollectionGuardConfig } from "akita-ng-fire";
import { ActivatedRouteSnapshot } from "@angular/router";
import { ContractService } from "../+state/contract.service";
import { ContractState } from "../+state/contract.store";

@Injectable({ providedIn: 'root' })
@CollectionGuardConfig({ awaitSync: true })
export class ActiveContractGuard extends CollectionGuard<ContractState> {

  constructor(protected service: ContractService) {
    super(service);
  }

  /**
   * Sync and set active.
   * Use it on a route with :contractId in it.
   */
  sync(next: ActivatedRouteSnapshot) {
    return this.service.syncContractQuery(next.params.contractId);
  }
}
