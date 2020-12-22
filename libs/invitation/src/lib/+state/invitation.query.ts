import { Injectable } from '@angular/core';
import { QueryEntity, QueryConfig, Order } from '@datorama/akita';
import { InvitationStore, InvitationState } from './invitation.store';
import { Invitation } from './invitation.model';
import { AuthQuery } from '@blockframes/auth/+state';

@Injectable({ providedIn: 'root' })
@QueryConfig({ sortBy: 'date', sortByOrder: Order.DESC })
export class InvitationQuery extends QueryEntity<InvitationState> {

  constructor(protected store: InvitationStore, private authQuery: AuthQuery) {
    super(store);
  }

  isFromMe(invitation: Invitation) {
    const user = this.authQuery.user;
    return invitation.fromOrg?.id === user.orgId || invitation.fromUser?.uid === user.uid;
  }

  isToMe(invitation: Invitation) {
    const user = this.authQuery.user;
    return invitation.toOrg?.id === user.orgId || invitation.toUser?.uid === user.uid;
  }

  currentUserIsGuest(invitation: Invitation) {
    const user = this.authQuery.user;
    return (invitation.mode === 'request' && invitation.fromUser.uid === user.uid) ||
    (invitation.mode === 'invitation' && invitation.toUser.uid === user.uid)
  }

  selectByEventId(eventId: string) {
    return this.selectEntity((i: Invitation) => i.eventId === eventId);
  }

  /** Query all invitation where current user is a guest */
  whereCurrentUserIsGuest(filter: (invitation: Invitation) => boolean = () => true) {
    return this.selectAll({ filterBy: i => this.currentUserIsGuest(i) && filter(i) });
  }

  /** Query all invitation from current user / org */
  fromMe(filter: (invitation: Invitation) => boolean = () => true) {
    return this.selectAll({ filterBy: i => this.isFromMe(i) && filter(i) });
  }

  /** Query all invitation to current user / org */
  toMe(filter: (invitation: Invitation) => boolean = () => true) {
    return this.selectAll({ filterBy: i => this.isToMe(i) && filter(i) });
  }
}
