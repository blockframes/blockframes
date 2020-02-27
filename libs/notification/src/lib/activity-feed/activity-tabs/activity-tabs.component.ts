import { ChangeDetectionStrategy, Component, OnInit, Input } from '@angular/core';
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
import { NotificationDocument, NotificationType } from '@blockframes/notification/types';
import { DateGroup } from '@blockframes/utils/helpers';

export interface ActivityTab {
  label: string;
  filters: NotificationType[];
}

@Component({
  selector: 'notification-activity-tabs',
  templateUrl: './activity-tabs.component.html',
  styleUrls: ['./activity-tabs.component.scss'],
  providers: [InvitationQuery, InvitationStore],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ActivityTabsComponent implements OnInit {
  @Input() applicationTabs: ActivityTab[];

  public organization: Organization = this.organizationQuery.getActive();

  // Filters (arrays of notification types)
  public titleFilters = ['movieSubmitted', 'movieAccepted'];

  public filter = new FormControl();
  public filter$ = this.filter.valueChanges.pipe(startWith(this.filter.value));
  public notifications$: Observable<DateGroup<NotificationDocument[]>>;

  constructor(
    private notificationQuery: NotificationQuery,
    private organizationQuery: OrganizationQuery
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

  /** Returns the number of notifications according to the filter */
  getCount(filter?: Notification['type'][]): number {
    return this.notificationQuery.getCount(notification =>
      filter ? filter.includes(notification.type) : true
    );
  }
}
