import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import {
  NotificationQuery,
  InvitationQuery,
  InvitationStore,
  Notification
} from '@blockframes/notification';
import { Organization } from '@blockframes/organization/+state/organization.model'
import { OrganizationQuery } from '@blockframes/organization/+state/organization.query';
import { RouterQuery } from '@datorama/akita-ng-router-store';
import { Observable } from 'rxjs';
import { map, startWith, switchMap } from 'rxjs/operators';import { FormControl } from '@angular/forms';
;

@Component({
  selector: 'notification-activity-feed',
  templateUrl: './activity-feed.component.html',
  styleUrls: ['./activity-feed.component.scss'],
  providers: [InvitationQuery, InvitationStore],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ActivityFeedComponent implements OnInit {

  public organization: Organization;
  public app: string;

  public filter = new FormControl();
  public filter$ = this.filter.valueChanges.pipe(startWith(this.filter.value));
  public notifications$: Observable<Notification[]>;
  public allNotifications$ = this.notificationQuery.selectAll();
  public allInvitations$ = this.invitationQuery.selectAll();

  constructor(
    private notificationQuery: NotificationQuery,
    private invitationQuery: InvitationQuery,
    private organizationQuery: OrganizationQuery,
    private routerQuery: RouterQuery
  ) {}

  ngOnInit() {
    this.organization = this.organizationQuery.getActive();
    this.app = this.routerQuery.getValue().state.root.data.app;
    this.notifications$ = this.filter$.pipe(
      switchMap(filter =>
        this.notificationQuery.selectAll({
          filterBy: notification => (filter ? notification.type === filter : true)
        })
      )
    );
  }

  /** Dynamic filter of notifications for each tab. */
  applyFilter(filter?: Notification['type']) {
    this.filter.setValue(filter);
  }
}
