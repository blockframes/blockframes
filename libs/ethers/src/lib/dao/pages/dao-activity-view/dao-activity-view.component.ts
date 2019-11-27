import { Component, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { DaoAction, DaoQuery } from '../../+state';

@Component({
  selector: 'dao-activity-view',
  templateUrl: './dao-activity-view.component.html',
  styleUrls: ['./dao-activity-view.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DaoActivityViewComponent implements OnInit {

  /** Observable which contains pending actions */
  public pendingActions$ = new Observable<DaoAction[]>();

  /** Observable which contains approved actions */
  public approvedActions$ = new Observable<DaoAction[]>();

  public selectedAction: DaoAction;

  // Flag to indicate whether sidenav is open or not
  public opened = false;

  constructor(
    private query: DaoQuery
  ){}

  ngOnInit() {
    this.pendingActions$ = this.query.pendingActions$;
    this.approvedActions$ = this.query.approvedActions$;
  }

  // also the sidenav is going to need a refactoring
  public openSidenav(action: DaoAction) {
    this.opened = true;
    this.selectedAction = action;
  }
}
