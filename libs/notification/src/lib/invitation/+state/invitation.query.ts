import { Injectable } from '@angular/core';
import { QueryEntity } from '@datorama/akita';
import { InvitationStore, InvitationState } from './invitation.store';
import { InvitationType, Invitation } from './invitation.firestore';
import { DateGroup } from '@blockframes/utils/helpers';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { formatDate } from '@angular/common';

@Injectable()
export class InvitationQuery extends QueryEntity<InvitationState> {
  constructor(protected store: InvitationStore) {
    super(store);
  }

  /** Group invitations by date in an object. */
  public groupInvitationsByDate(): Observable<DateGroup<Invitation[]>> {
    const filterBy = invitation =>
            invitation.type === InvitationType.fromUserToOrganization ||
            invitation.type === InvitationType.toWorkOnDocument;
    return this.selectAll({filterBy}).pipe(
      map(invits => {
        return invits.reduce((acc, invitation) => {
          // As Date cannot be used as an index type (key), we format the date into a string.
          const key = formatDate(invitation.date.toDate(), 'MMM dd, yyyy', 'en-US');

          acc[key] = [...(acc[key] || []), invitation];
          return acc;
        }, {});
      })
    );
  }
}
