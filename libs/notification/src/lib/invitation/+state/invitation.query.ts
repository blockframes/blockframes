import { Injectable } from '@angular/core';
import { QueryEntity, QueryConfig, Order } from '@datorama/akita';
import { InvitationStore, InvitationState } from './invitation.store';
import { DateGroup } from '@blockframes/utils/helpers';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { formatDate } from '@angular/common';
import { Invitation } from './invitation.model';

@Injectable({ providedIn: 'root' })
@QueryConfig({ sortBy: 'date', sortByOrder: Order.DESC })
export class InvitationQuery extends QueryEntity<InvitationState> {
  constructor(protected store: InvitationStore) {
    super(store);
  }

  /** Group invitations by date in an object. */
  public groupInvitationsByDate(): Observable<DateGroup<Invitation[]>> {
    return this.selectAll( ).pipe(
      map(invits => {
        return invits.reduce((acc, invitation) => {
          // As Date cannot be used as an index type (key), we format the date into a string.
          const key = formatDate(invitation.date as Date, 'MMM dd, yyyy', 'en-US');

          acc[key] = [...(acc[key] || []), invitation];
          return acc;
        }, {});
      })
    );
  }
}
