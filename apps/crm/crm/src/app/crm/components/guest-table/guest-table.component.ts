import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { Invitation, InvitationDetailed } from '@blockframes/invitation/+state';
import { getGuest } from '@blockframes/invitation/pipes/guest.pipe';
import { getValue } from '@blockframes/utils/helpers';

@Component({
  selector: 'invitation-guest-table',
  templateUrl: './guest-table.component.html',
  styleUrls: ['./guest-table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GuestTableComponent {
  public _invitations: Invitation[] | InvitationDetailed[];

  public headers = {
    'id': 'Id',
    'org': 'Org',
    'event.id': '',
    'event.title': 'Event title',
    'event.start': 'Event start',
    'event.end': 'Event end',
    'event.type': 'Event type',
    'event.isPrivate': 'Privacy status',
    'date': 'Invitation date',
    'guest.firstName': 'FirstName',
    'guest.lastName': 'LastName',
    'guestOrg': 'Guest org',
    'mode': 'Mode',
    'status': 'Status',
    'guest.email': 'Email',
    'movie': 'Movie'
  };

  @Input() initialColumns: string[] = [
    'id',
    'date',
    'guest.firstName',
    'guest.lastName',
    'mode',
    'status',
    'guest.email',
  ];

  @Input() set invitations(invitations: InvitationDetailed[]) {
    if (invitations) {
      this._invitations = invitations.map((invitation: InvitationDetailed) => {
        invitation.guest = getGuest(invitation, 'user');
        return invitation;
      });
    }
  }

  filterPredicateMovies(data, filter) {
    const columnsToFilter = [
      'id',
      'org.denomination.full',
      'org.denomination.public',
      'event.title',
      'event.type',
      'date',
      'guest.firstName',
      'guest.lastName',
      'mode',
      'status',
      'guest.email',
    ];
    const dataStr = columnsToFilter.map(c => getValue(data, c)).join();
    return dataStr.toLowerCase().indexOf(filter) !== -1;
  }
}
