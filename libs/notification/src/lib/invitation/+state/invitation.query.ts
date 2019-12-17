import { Injectable } from '@angular/core';
import { QueryEntity } from '@datorama/akita';
import { InvitationStore, InvitationState } from './invitation.store';
import { map } from 'rxjs/operators';
import { formatDate } from '@blockframes/utils/helpers';
import { Invitation } from './invitation.firestore';
import { Observable } from 'rxjs';

@Injectable()
export class InvitationQuery extends QueryEntity<InvitationState> {
  constructor(protected store: InvitationStore) {
    super(store);
  }

  /** Group invitations by date in an object. */
  public groupInvitationsByDate() {
    return this.selectAll().pipe(
      map(invits => {
        return invits.reduce((acc, invitation) => {
          // As Date cannot be used as an index type (key), we format the date into a string.
          const key = formatDate(invitation.date.toDate());

          acc[key] = [...(acc[key] || []), invitation];
          return acc;
        }, {});
      })
    );
  }
}
