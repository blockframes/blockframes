import { Injectable } from "@angular/core";
import { CollectionGuard, CollectionGuardConfig } from "akita-ng-fire";
import { ContractVersionService } from "../+state/contract-version.service";
import { ContractVersionState } from "../+state/contract-version.store";

@Injectable({ providedIn: 'root' })
@CollectionGuardConfig({ awaitSync: true })
export class ContractActiveVersionsGuard extends CollectionGuard<ContractVersionState> {

  constructor(service: ContractVersionService) {
    super(service);
  }

  /**
   * Sync on the active contract's versions subcollection.
   */
  sync() {
    return this.service.syncCollection();
  }
}
