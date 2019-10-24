import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { InvitationService } from '../+state/invitation.service';
import { Invitation } from '@blockframes/invitation/types';
import { AuthQuery } from '@blockframes/auth';
import { CollectionGuard, CollectionGuardConfig } from 'akita-ng-fire';
import { InvitationState, InvitationQuery, InvitationStatus, InvitationStore } from '../+state';
import { map, tap } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
@CollectionGuardConfig({ awaitSync: true })
export class NoOrganizationInvitationGuard extends CollectionGuard<InvitationState> {

  constructor(protected service: InvitationService, private query: InvitationQuery) {
    super(service);
  }

  sync() {
    return this.service.syncUserInvitations().pipe(
      map(_ => this.query.getAll()),
      map(invitations => {
          if (!invitations) {
            return false;
          }
          if (invitations.find(invitation => invitation.status === InvitationStatus.pending)) {
            return 'layout/organization/home';
          }
          return true;
      })
    );
  }
}
