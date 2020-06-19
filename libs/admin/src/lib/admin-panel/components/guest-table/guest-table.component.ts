import { Component, ChangeDetectionStrategy, Input, OnInit } from '@angular/core';
import { Invitation } from '@blockframes/invitation/+state';
import { getGuest } from '@blockframes/invitation/pipes/guest.pipe';
import { getValue } from '@blockframes/utils/helpers';
import { InvitationDetailed } from '../../pages/invitations/invitations.component';

@Component({
  selector: 'invitation-guest-table',
  templateUrl: './guest-table.component.html',
  styleUrls: ['./guest-table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GuestTableComponent implements OnInit {
  public _invitations: Invitation[] | InvitationDetailed[];

  public headers = {
    'id': 'Id',
    'org': 'Org',
    'event.title': 'Event',
    'event.start': 'Event start',
    'event.end': 'Event end',
    'date': 'Invitation date',
    'guest.firstName': 'FirstName',
    'guest.lastName': 'LastName',
    'mode': 'Type',
    'status': 'Status',
    'guest.email': 'Email'
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
      this._invitations = invitations.map(i => {
        const invitation = { ...i } as InvitationDetailed;
        invitation.guest = getGuest(invitation, 'user');
        return invitation;
      });
    }
  }

  ngOnInit() {
    // @TODO (#2952) WIP
    console.log(this.invitations);
  }

  filterPredicateMovies(data: any, filter) {
    const columnsToFilter = [
      'id',
      'org.denomination.full',
      'org.denomination.public',
      'event.title',
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
