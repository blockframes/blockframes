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

  public versionColumnsMovies = {
    'id': 'Id',
    'date': 'Date',
    'toUser.firstName': 'FirstName',
    'toUser.lastName': 'LastName',
    'mode': 'Type',
    'status': 'Status',
    'toUser.email': 'Email'
  };

  public initialColumnsMovies: string[] = [
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
}
