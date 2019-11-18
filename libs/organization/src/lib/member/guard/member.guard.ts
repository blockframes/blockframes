import { Injectable } from "@angular/core";
import { CollectionGuardConfig, CollectionGuard } from "akita-ng-fire";
import { tap } from "rxjs/operators";
import { OrganizationService } from "../../+state";
import { AFM_DISABLE } from "@env";
import { MemberState } from "../+state/member.store";
import { MemberService } from "../+state/member.service";

@Injectable({ providedIn: 'root' })
@CollectionGuardConfig({ awaitSync: true })
export class MemberGuard extends CollectionGuard<MemberState> {
  constructor(
    protected service: MemberService,
    private organizationService: OrganizationService
  ) {
    super(service);
  }

  sync() {
    return this.service.syncOrgMembers().pipe(
      tap(_ => {
        // TODO issue#1146
        if (AFM_DISABLE) {
          this.organizationService.retrieveDataAndAddListeners();
        }
      })
    );
  }

  canDeactivate() {
    // TODO issue#1146
    if (AFM_DISABLE) {
      this.organizationService.removeAllListeners();
    }
    return true;
  }
}
