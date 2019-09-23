import { Injectable } from '@angular/core';
import { QueryEntity, Order } from '@datorama/akita';
import { Invitation, InvitationType } from './invitation.model';
import { InvitationStore, InvitationState } from './invitation.store';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class InvitationQuery extends QueryEntity<InvitationState, Invitation> {
  constructor(protected store: InvitationStore) {
    super(store);
  }

  /** Returns only invitations type of 'joinOrganization': members who ask organization to join it */
  public invitationsToJoinOrganization$: Observable<Invitation[]> = this.selectAll( {
    filterBy: invitation => invitation.type === InvitationType.fromUserToOrganization,
    sortBy: 'date',
    sortByOrder: Order.DESC
  }
  );

  /** Returns only invitations type of 'toOrganization': members invited by the organization */
  public invitationsFromOrganization$: Observable<Invitation[]> = this.selectAll().pipe(
    map(invitations =>
      invitations.filter(invitation => invitation.type === InvitationType.fromOrganizationToUser)
    )
  );
}
