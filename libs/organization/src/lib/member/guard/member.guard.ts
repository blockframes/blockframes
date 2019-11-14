import { Injectable } from "@angular/core";
import { CollectionGuardConfig, CollectionGuard } from "akita-ng-fire";
import { MemberState, MemberService } from "../+state";

@Injectable({ providedIn: 'root' })
@CollectionGuardConfig({ awaitSync: true })
export class MemberGuard extends CollectionGuard<MemberState> {
  constructor(protected service: MemberService) {
    super(service);
  }

  sync() {
    return this.service.syncOrgMembers();
  }
}
