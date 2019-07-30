import { Component, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { of } from 'rxjs';
import { OrganizationService } from '../../+state';

// TODO #638: delete this mock values
const mockPendingActions = [
  {
    docName: 'Lorem Ipsum',
    signers: ['1', '2', '3'],
    counterSigners: ['4', '5', '6']
  },
  {
    docName: 'Lorem Ipsum',
    signers: ['1', '2', '3'],
    counterSigners: ['4', '5', '6']
  },
  {
    docName: 'Lorem Ipsum',
    signers: ['1', '2', '3'],
    counterSigners: ['4', '5', '6']
  },
  {
    docName: 'Lorem Ipsum',
    signers: ['1', '2', '3'],
    counterSigners: ['4', '5', '6']
  }
];

const mockApprovedActions = [
  {
    docName: 'Lorem Ipsum',
    signers: ['1', '2', '3'],
    counterSigners: ['4', '5', '6'],
    date: '09.06.2019'
  },
  {
    docName: 'Lorem Ipsum',
    signers: ['1', '2', '3'],
    counterSigners: ['4', '5', '6'],
    date: '09.06.2019'
  },
  {
    docName: 'Lorem Ipsum',
    signers: ['1', '2', '3'],
    counterSigners: ['4', '5', '6'],
    date: '09.06.2019'
  },
  {
    docName: 'Lorem Ipsum',
    signers: ['1', '2', '3'],
    counterSigners: ['4', '5', '6'],
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
  // TODO #638: work with real data
  public pendingActions$ = of(mockPendingActions);

  /** Observable which contains approved actinos */
  // TODO #638: work with real data
  public approvedActions$ = of(mockApprovedActions);

  // TODO #638: replace any
  public signers: any[] = [];

  // Flag to indicate whether sidenav is open or not
  public opened = false;

  constructor(private service: OrganizationService){}
  
  ngOnInit() {
    this.service.instantiateMockData(); // TODO remove mockdata : issue 676
  }


  // TODO #638: replace any refactor the function when you know how the real data is going to look like
  // also the sidenav is going to need a refactoring
  public openSidenav(signers: any) {
    if (JSON.stringify(signers) !== JSON.stringify(this.signers)) {
      this.signers = signers;
      this.opened = true;
    } else {
      this.opened = false;
      this.signers = [];
    }
  }
}
