import { ChangeDetectionStrategy, Component, OnInit, Input } from '@angular/core';
import { Organization } from '@blockframes/organization/organization/+state/organization.model';
import { OrganizationQuery } from '@blockframes/organization/organization/+state/organization.query';
import { Observable, BehaviorSubject } from 'rxjs';
import { startWith, switchMap } from 'rxjs/operators';
import { FormControl } from '@angular/forms';
import { NotificationDocument, NotificationType } from '@blockframes/notification/types';
import { DateGroup } from '@blockframes/utils/helpers';
import { InvitationQuery } from '@blockframes/notification/invitation/+state/invitation.query';
import { InvitationStore } from '@blockframes/notification/invitation/+state/invitation.store';
import { NotificationQuery } from '@blockframes/notification/notification/+state/notification.query';
import { Notification } from '@blockframes/notification/notification/+state/notification.model';

export interface ActivityTab {
  label: string;
  filters: 'All' | NotificationType[];
}

const defaultTabs: ActivityTab[] = [
  {
    label: 'All',
    filters: 'All'
  },
  {
    label: 'Titles',
    filters: ['movieSubmitted', 'movieAccepted']
  }
];

@Component({
  selector: 'notification-activity-tabs',
  templateUrl: './activity-tabs.component.html',
  styleUrls: ['./activity-tabs.component.scss'],
  providers: [InvitationQuery, InvitationStore],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ActivityTabsComponent implements OnInit {
  public tabs$ = new BehaviorSubject(defaultTabs);
  @Input() customTabs: ActivityTab[];

  public organization: Organization = this.organizationQuery.getActive();

  public filter = new FormControl();
  public filter$ = this.filter.valueChanges.pipe(startWith('All'));
  public notifications$: Observable<DateGroup<NotificationDocument[]>>;
  public invitationCount = this.invitationQuery.getCount();
  public isLoading$ = this.notificationQuery.selectLoading();

  constructor(
    private notificationQuery: NotificationQuery,
    private invitationQuery: InvitationQuery,
    private organizationQuery: OrganizationQuery
  ) {}

  ngOnInit() {
    this.notifications$ = this.filter$.pipe(
      switchMap(filter => this.notificationQuery.groupNotificationsByDate(filter))
    );
    this.tabs$.next([...defaultTabs, ...this.customTabs]);
  }

  /** Dynamic filter of notifications for each tab */
  applyFilter(filter?: string | Notification['type'][]) {
    this.filter.setValue(filter);
  }

  /** Returns the number of notifications according to the filter */
  getCount(filter?: Notification['type'][]): number {
    return this.notificationQuery.getCount(notification =>
      filter && typeof filter !== 'string' ? filter.includes(notification.type) : true
    );
  }
}
