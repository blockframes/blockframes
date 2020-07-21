// Agnular
import { Injectable } from '@angular/core';

// akita ng fire
import { CollectionGuard, CollectionGuardConfig } from 'akita-ng-fire';

// Blockframes
import { AuthQuery } from '@blockframes/auth/+state/auth.query';
import { InvitationState } from '../+state/invitation.store';
import { InvitationService } from '../+state/invitation.service';

// RxJs
import { switchMap, filter } from 'rxjs/operators';
import { PermissionsQuery } from '@blockframes/permissions/+state';
import { combineLatest } from 'rxjs';
import { OrganizationQuery } from '@blockframes/organization/+state';

@Injectable({ providedIn: 'root' })
@CollectionGuardConfig({ awaitSync: false })
export class InvitationGuard extends CollectionGuard<InvitationState> {
  constructor(
    service: InvitationService,
    private authQuery: AuthQuery,
    private orgQuery: OrganizationQuery,
    private permissionQuery: PermissionsQuery
  ) {
    super(service);
  }

  /** This sync on invitations where userId is the same as the connected user id */
  sync() {
    return combineLatest([
      this.authQuery.user$,
      this.orgQuery.selectActiveId(),
      this.permissionQuery.isAdmin$
    ]).pipe(
      filter(([user]) => !!user && !!user.uid),
      switchMap(([ user, orgId, isAdmin ]) => {
        if (isAdmin) {
          return combineLatest([
            this.service.syncCollection(ref => ref.where('fromOrg.id', '==', orgId)),
            this.service.syncCollection(ref => ref.where('toOrg.id', '==', orgId)),

            this.service.syncCollection(ref => ref.where('fromUser.uid', '==', user.uid)),
            this.service.syncCollection(ref => ref.where('toUser.uid', '==', user.uid)),
          ])
        } else {
          return combineLatest([
            this.service.syncCollection(ref => ref.where('fromUser.uid', '==', user.uid)),
            this.service.syncCollection(ref => ref.where('toUser.uid', '==', user.uid)),
          ])
        }
      })
    )
  }
}
