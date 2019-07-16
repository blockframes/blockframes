import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';

// TODO: delete after real data is available
const mockPendingActions = [
  {
    docName: 'Lorem Ipsum',
    signed: ['1', '2', '3'],
    counterSigned: ['4', '5', '6']
  },
  {
    docName: 'Lorem Ipsum',
    signed: ['1', '2', '3'],
    counterSigned: ['4', '5', '6']
  },
  {
    docName: 'Lorem Ipsum',
    signed: ['1', '2', '3'],
    counterSigned: ['4', '5', '6']
  },
  {
    docName: 'Lorem Ipsum',
    signed: ['1', '2', '3'],
    counterSigned: ['4', '5', '6']
  }
];

const mockapprovedActions = [
  {
    docName: 'Lorem Ipsum',
    signed: ['1', '2', '3'],
    counterSigned: ['4', '5', '6'],
    date: '09.06.2019'
  },
  {
    docName: 'Lorem Ipsum',
    signed: ['1', '2', '3'],
    counterSigned: ['4', '5', '6'],
    date: '09.06.2019'
  },
  {
    docName: 'Lorem Ipsum',
    signed: ['1', '2', '3'],
    counterSigned: ['4', '5', '6'],
    date: '09.06.2019'
  },
  {
    docName: 'Lorem Ipsum',
    signed: ['1', '2', '3'],
    counterSigned: ['4', '5', '6'],
    date: '09.06.2019'
  }
];
@Component({
  selector: 'org-activity-view',
  templateUrl: './organization-activity-view.component.html',
  styleUrls: ['./organization-activity-view.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OrganizationActivityViewComponent implements OnInit {
  /** Observable which contains pending actions */
  // TODO: work with real data
  public pendingActions = mockPendingActions;

  /** Observable which contains approved actinos */
  // TODO: work with real data
  public approvedActions = mockapprovedActions;

  // Keep the constructor and ngOnInit for later
  constructor() {}

  ngOnInit() {}
}
