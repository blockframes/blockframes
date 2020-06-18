import { Component, ChangeDetectionStrategy, Input, OnInit } from '@angular/core';
import { Invitation } from '@blockframes/invitation/+state';
import { getValue } from '@blockframes/utils/helpers';

@Component({
  selector: 'invitation-guest-table',
  templateUrl: './guest-table.component.html',
  styleUrls: ['./guest-table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GuestTableComponent implements OnInit {

  public headers = {
    'id': 'Id',
    'org.denomination': 'Org',
    'event.title': 'Event',
    'date': 'Date',
    'toUser.firstName': 'FirstName',
    'toUser.lastName': 'LastName',
    'mode': 'Type',
    'status': 'Status',
    'toUser.email': 'Email'
  };

  @Input() initialColumns: string[] = [
    'id',
    'date',
    'toUser.firstName',
    'toUser.lastName',
    'mode',
    'status',
    'toUser.email',
  ];

  @Input() invitations: Invitation[ ];

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
      'toUser.firstName',
      'toUser.lastName',
      'mode',
      'status',
      'toUser.email',
    ];
    const dataStr = columnsToFilter.map(c => getValue(data, c)).join();
    return dataStr.toLowerCase().indexOf(filter) !== -1;
  }

  public getEventPath(eventId: string) {
    return `/c/o/admin/panel/event/${eventId}`;
  }

}
