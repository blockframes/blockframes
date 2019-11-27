import { Injectable } from "@angular/core";
import { CollectionGuardConfig, CollectionGuard } from "akita-ng-fire";
import { MemberState } from "../+state/member.store";
import { MemberService } from "../+state/member.service";

@Injectable({ providedIn: 'root' })
@CollectionGuardConfig({ awaitSync: true })
export class MemberGuard extends CollectionGuard<MemberState> {
  constructor(
    protected service: MemberService,
  ) {
    super(service);
  }

  sync() {
    return this.service.syncOrgMembers()
  }

  canDeactivate() {
    return true;
  }
}
