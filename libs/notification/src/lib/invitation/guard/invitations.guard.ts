import { Injectable } from '@angular/core';
import { CollectionGuard, CollectionGuardConfig } from 'akita-ng-fire';
import { AuthQuery } from '@blockframes/auth/+state/auth.query';
import { InvitationState } from '../+state/invitation.store';
import { InvitationService } from '../+state/invitation.service';
import { switchMap } from 'rxjs/operators';
import { combineLatest } from 'rxjs';

@Injectable({ providedIn: 'root' })
@CollectionGuardConfig({ awaitSync: false })
export class InvitationGuard extends CollectionGuard<InvitationState> {
  constructor(service: InvitationService, private authQuery: AuthQuery) {
    super(service);
  }

  /** This sync on invitations where userId is the same as the connected user id */
  sync() {
    return this.authQuery.user$.pipe(
      switchMap(user => combineLatest([
        this.service.syncCollection(ref => ref.where('toUser', '==', user.uid)),
        this.service.syncCollection(ref => ref.where('toEmail', '==', user.email)),
      ]))
    );
  }
}
