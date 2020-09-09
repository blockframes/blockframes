import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { InvitationDetailed } from '@blockframes/invitation/+state';
import { getGuest } from '@blockframes/invitation/pipes/guest.pipe';
import { getValue } from '@blockframes/utils/helpers';

@Component({
  selector: 'invitation-guest-table',
  templateUrl: './guest-table.component.html',
  styleUrls: ['./guest-table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GuestTableComponent {
  public _invitations: InvitationDetailed[];

  public headers = {
    'id': 'Id',
    'org': 'Org',
    'eventId': '',
    'eventTitle': 'Event title',
    'eventStart': 'Event start',
    'eventEnd': 'Event end',
    'eventType': 'Event type',
    'eventIsPrivate': 'Privacy status',
    'date': 'Invitation date',
    'guestFirstName': 'FirstName',
    'guestLastName': 'LastName',
    'guestOrg': 'Guest org',
    'mode': 'Mode',
    'status': 'Status',
    'guestEmail': 'Email',
    'movie': 'Movie'
  };

  @Input() initialColumns: string[] = [
    'id',
    'date',
    'guestFirstName',
    'guestLastName',
    'mode',
    'status',
    'guestEmail',
  ];

  @Input() set invitations(invitations: any[]) {
    if (invitations) {
      this._invitations = invitations.map(i => {
        const invitation = { ...i } as InvitationDetailed;
        invitation.guest = getGuest(invitation, 'user');
        return invitation;
      });
    }
  }

  filterPredicateMovies(data: any, filter) {
    const columnsToFilter = [
      'id',
      'org.denomination.full',
      'org.denomination.public',
      'eventTitle',
      'eventType',
      'date',
      'guestFirstName',
      'guestLastName',
      'mode',
      'status',
      'guestEmail',
    ];
    const dataStr = columnsToFilter.map(c => getValue(data, c)).join();
    return dataStr.toLowerCase().indexOf(filter) !== -1;
  }
}
