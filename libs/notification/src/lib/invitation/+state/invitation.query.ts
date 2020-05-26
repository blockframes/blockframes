import { Injectable } from '@angular/core';
import { QueryEntity, QueryConfig, Order } from '@datorama/akita';
import { InvitationStore, InvitationState } from './invitation.store';
import { switchMap } from 'rxjs/operators';
import { Invitation } from './invitation.model';
import { AuthQuery } from '@blockframes/auth/+state';

@Injectable({ providedIn: 'root' })
@QueryConfig({ sortBy: 'date', sortByOrder: Order.DESC })
export class InvitationQuery extends QueryEntity<InvitationState> {
  constructor(protected store: InvitationStore, private authQuery: AuthQuery) {
    super(store);
  }

  selectByDocId(docId: string) {
    return this.selectEntity((i: Invitation) => i.docId === docId);
  }

  /** Query all invitation from current user / org */
  fromMe() {
    return this.authQuery.user$.pipe(
      switchMap(user => {
        const fromMe = (i: Invitation) => i.fromOrg?.id === user.orgId || i.fromUser?.uid === user.uid;
        return this.selectAll({ filterBy: fromMe });
      })
    );
  }

  /** Query all invitation to current user / org */
  toMe() {
    return this.authQuery.user$.pipe(
      switchMap(user => {
        const toMe = (i: Invitation) => i.toOrg?.id === user.orgId || i.toUser?.uid === user.uid;
        return this.selectAll({ filterBy: toMe });
      })
    );
  }
}
