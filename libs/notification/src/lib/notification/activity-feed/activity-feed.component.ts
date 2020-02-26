import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import {
  NotificationQuery,
  InvitationQuery,
  InvitationStore,
  Notification
} from '@blockframes/notification';
import { Organization } from '@blockframes/organization/+state/organization.model';
import { OrganizationQuery } from '@blockframes/organization/+state/organization.query';
import { Observable } from 'rxjs';
import { startWith, switchMap } from 'rxjs/operators';
import { FormControl } from '@angular/forms';
import { NotificationDocument } from '@blockframes/notification/types';
import { DateGroup } from '@blockframes/utils/helpers';
import { RouterQuery } from '@datorama/akita-ng-router-store';

@Component({
  selector: 'notification-activity-feed',
  templateUrl: './activity-feed.component.html',
  styleUrls: ['./activity-feed.component.scss'],
  providers: [InvitationQuery, InvitationStore],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ActivityFeedComponent implements OnInit {
  public organization: Organization = this.organizationQuery.getActive();
  public appName: string = this.routerQuery.getValue().state.root.data.app;

  // Filters (arrays of notification types)
  public titleFilters = ['movieSubmitted', 'movieAccepted'];
  public dealFilters = ['newContract', 'contractInNegotiation'];
  public deliveryFilters = ['newSignature', 'finalSignature'];

  public filter = new FormControl('');
  public filter$ = this.filter.valueChanges.pipe(startWith(this.filter.value));
  public notifications$: Observable<DateGroup<NotificationDocument[]>>;
  public allNotifications$ = this.notificationQuery.groupNotificationsByDate();

  constructor(
    private notificationQuery: NotificationQuery,
    private organizationQuery: OrganizationQuery,
    private routerQuery: RouterQuery
  ) {}

  ngOnInit() {
    this.notifications$ = this.filter$.pipe(
      switchMap(filter => this.notificationQuery.groupNotificationsByDate(filter))
    );
  }

  /** Dynamic filter of notifications for each tab */
  applyFilter(filter?: string | Notification['type'][]) {
    this.filter.setValue(filter);
  }
}
