import { Component, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { OrganizationAction, OrganizationQuery } from '../../+state';

@Component({
  selector: 'org-activity-view',
  templateUrl: './organization-activity-view.component.html',
  styleUrls: ['./organization-activity-view.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OrganizationActivityViewComponent implements OnInit {

  /** Observable which contains pending actions */
  public pendingActions$ = new Observable<OrganizationAction[]>();

  /** Observable which contains approved actions */
  public approvedActions$ = new Observable<OrganizationAction[]>();

  public selectedAction: OrganizationAction;

  // Flag to indicate whether sidenav is open or not
  public opened = false;

  constructor(
    private query: OrganizationQuery
  ){}

  ngOnInit() {
    this.pendingActions$ = this.query.pendingActions$;
    this.approvedActions$ = this.query.approvedActions$;
  }


  // also the sidenav is going to need a refactoring
  public openSidenav(action: OrganizationAction) {
    this.opened = true;
    this.selectedAction = action;
  }
}
