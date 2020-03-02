import { Injectable } from '@angular/core';
import { QueryEntity } from '@datorama/akita';
import { InvitationStore, InvitationState } from './invitation.store';
import { InvitationType } from './invitation.firestore';
import { DateGroup } from '@blockframes/utils/helpers';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { formatDate } from '@angular/common';
import { Invitation } from './invitation.model';

function getYesterday() {
  const today = new Date();
  const yesterday = today.setDate(today.getDate() - 1);
  return new Date(yesterday);
}

function isSameDay(target: Date, baseDate: Date) {
  return (
    target.getDate() === baseDate.getDate() &&
    target.getMonth() === baseDate.getMonth() &&
    target.getFullYear() === baseDate.getFullYear()
  );
}
const isToday = (target: Date) => isSameDay(target, new Date());
const isYesterday = (target: Date) => isSameDay(target, getYesterday());

@Injectable()
export class InvitationQuery extends QueryEntity<InvitationState> {
  constructor(protected store: InvitationStore) {
    super(store);
  }

  /** Group invitations by date in an object. */
  public groupInvitationsByDate(): Observable<DateGroup<Invitation[]>> {
    const filterBy = invitation =>
      // We don't want invitations from organization to user, since only org admins can see them.
      invitation.type === InvitationType.fromUserToOrganization ||
      invitation.type === InvitationType.toWorkOnDocument;
    return this.selectAll({filterBy}).pipe(
      map(invitations => {
        return invitations.reduce((acc, invitation) => {
          const date = invitation.date.toDate();
          // As Date cannot be used as an index type (key), we format the date into a string.
          const key = isToday(date) ? 'Today'
            : isYesterday(date) ? 'Yesterday'
            : formatDate(invitation.date.toDate(), 'MMM dd, yyyy', 'en-US');
          const information = this.createInvitationInformation(invitation);
          const notif = {
            ...invitation,
            ...information,
            date: invitation.date.toDate()
          };
          acc[key] = [...(acc[key] || []), notif];
          return acc;
        }, {});
      })
    );
  }

  public createInvitationInformation(invitation: Invitation) {
    switch (invitation.type) {
      case InvitationType.fromUserToOrganization:
        return {
          message: `${invitation.user.name} ${invitation.user.surname} wants to join your organization`,
          imgRef: invitation.user.avatar
        };
      case InvitationType.fromOrganizationToUser:
        return {
          message: `Your organization sent an invitation to this user email: ${invitation.user.email}`,
          imgRef: invitation.user.avatar
        };
    }
  }
}
