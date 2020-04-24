import { Injectable } from '@angular/core';
import { CollectionGuard, CollectionGuardConfig } from 'akita-ng-fire';
import { AuthQuery } from '@blockframes/auth/+state/auth.query';
import { InvitationState } from '../+state/invitation.store';
import { InvitationService } from '../+state/invitation.service';
import { switchMap } from 'rxjs/operators';
import { combineLatest } from 'rxjs';

const testData = (query, name) => {
  query.get().then(data => {
    console.info(name, 'success!', data.docs.map(x => x.data()))
  }).catch(err => {
    console.error(name, 'failed!', err)
  })
}

@Injectable({ providedIn: 'root' })
@CollectionGuardConfig({ awaitSync: false })
export class InvitationGuard extends CollectionGuard<InvitationState> {
  constructor(service: InvitationService, private authQuery: AuthQuery) {
    super(service);
    // @ts-ignore
    window.service = service;
    // @ts-ignore
    window.db = service.db.firestore;
    //@ts-ignore
    testData(service.db.collection('invitations').ref.where('fromOrg.id', '==', 'jnbHKBP5YLvRQGcyQ8In'), 'query my org')
    //@ts-ignore
    testData(service.db.collection('invitations').ref.where('fromUser.uid', '==', '1M9DUDBATqayXXaXMYThZGtE9up1'), 'query my user')
    //@ts-ignore
    testData(service.db.collection('invitations').ref, 'query all')
    //@ts-ignore
    testData(service.db.collection('invitations').ref.where('fromOrg.id', '==', 'XXX'), 'query another org')
    //@ts-ignore
    testData(service.db.collection('invitations').ref.where('fromUser.uid', '==', 'jnbHKBP5YLvRQGcyQ8In'), 'query another user')  }

  /** This sync on invitations where userId is the same as the connected user id */
  sync() {
    return this.authQuery.user$.pipe(
      switchMap(user => combineLatest([
        this.service.syncCollection(ref => ref.where('toUser.uid', '==', user.uid)),
        this.service.syncCollection(ref => ref.where('toUser.email', '==', user.email)),
      ]))
    );
  }
}
