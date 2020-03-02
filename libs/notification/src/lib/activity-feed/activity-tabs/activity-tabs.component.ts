import { ChangeDetectionStrategy, Component, OnInit, Input, OnDestroy } from '@angular/core';
import {
  NotificationQuery,
  InvitationQuery,
  InvitationStore,
  Notification
} from '@blockframes/notification';
import { Organization } from '@blockframes/organization/+state/organization.model';
import { OrganizationQuery } from '@blockframes/organization/+state/organization.query';
import { Observable, BehaviorSubject, Subscription } from 'rxjs';
import { startWith, switchMap } from 'rxjs/operators';
import { FormControl } from '@angular/forms';
import { NotificationType } from '@blockframes/notification/types';
import { DateGroup } from '@blockframes/utils/helpers';
import { InvitationService } from '@blockframes/notification/invitation/+state';
import { AuthQuery } from '@blockframes/auth';

export interface ActivityTab {
  label: string;
  filters: string | NotificationType[];
}

const defaultTabs: ActivityTab[] = [
  {
    label: 'All',
    filters: 'All'
  },
  {
    label: 'Titles',
    filters: [NotificationType.movieSubmitted, NotificationType.movieAccepted]
  }
];

@Component({
  selector: 'notification-activity-tabs',
  templateUrl: './activity-tabs.component.html',
  styleUrls: ['./activity-tabs.component.scss'],
  providers: [InvitationQuery, InvitationStore],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ActivityTabsComponent implements OnInit, OnDestroy {
  public tabs$ = new BehaviorSubject(defaultTabs);
  @Input() customTabs: ActivityTab[];

  public organization: Organization = this.organizationQuery.getActive();

  public filter = new FormControl();
  public filter$ = this.filter.valueChanges.pipe(startWith('All'));
  public notifications$: Observable<DateGroup<Notification[]>>;
  public invitations$ = this.invitationQuery.groupInvitationsByDate();
  public invitationCount$ = this.invitationQuery.selectCount();
  public isLoading$ = this.notificationQuery.selectLoading();

  private sub: Subscription;

  constructor(
    private notificationQuery: NotificationQuery,
    private invitationQuery: InvitationQuery,
    private organizationQuery: OrganizationQuery,
    private authQuery: AuthQuery,
    private invitationStore: InvitationStore,
    private invitationService: InvitationService,
  ) {}

  ngOnInit() {
    this.notifications$ = this.filter$.pipe(
      switchMap(filter => this.notificationQuery.groupNotificationsByDate(filter))
    );
    const storeName = this.invitationStore.storeName;
    const queryFn = ref =>
      ref.where('organization.id', '==', this.authQuery.orgId);
    if (this.authQuery.orgId) {
      this.sub = this.invitationService.syncCollection(queryFn, { storeName }).subscribe();
    }
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

  ngOnDestroy() {
    this.sub.unsubscribe();
  }
}
