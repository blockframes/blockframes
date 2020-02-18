import { Injectable } from "@angular/core";
import { CollectionGuardConfig } from "akita-ng-fire";
import { DaoService } from "../+state";

@Injectable({ providedIn: 'root' })
@CollectionGuardConfig({ awaitSync: true })
export class DaoGuard {
  constructor(
    private service: DaoService
  ) { }

  canActivate() {
    this.service.retrieveDataAndAddListeners();
    return true;
  }

  canDeactivate() {
    this.service.removeAllListeners();
    return true;
  }
}
