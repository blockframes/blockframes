import { ChangeDetectionStrategy, Component, OnInit, OnDestroy } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import {
  Notification,
  NotificationQuery,
  InvitationQuery,
  InvitationStore,
  InvitationService
} from '@blockframes/notification';
import { AuthQuery } from '@blockframes/auth';
import { RouterQuery } from '@datorama/akita-ng-router-store';
import { Invitation } from '@blockframes/invitation/types';
import { OrganizationQuery } from '../../+state/organization.query';

@Component({
  selector: 'notification-activity-feed',
  templateUrl: './activity-feed.component.html',
  styleUrls: ['./activity-feed.component.scss'],
  providers: [InvitationQuery, InvitationStore],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ActivityFeedComponent implements OnInit, OnDestroy {
  public notificationsByDate$: Observable<{}>;
  public invitationsByDate$: Observable<{}>;
  public notifications$: Observable<Notification[]>;
  public invitations$: Observable<Invitation[]>;

  public organizationName: string;
  public app: string;
  public today: Date = new Date();
  public yesterday: Date = new Date();

  private sub: Subscription;

  constructor(
    private notificationQuery: NotificationQuery,
    private invitationQuery: InvitationQuery,
    private invitationStore: InvitationStore,
    private invitationService: InvitationService,
    private organizationQuery: OrganizationQuery,
    private authQuery: AuthQuery,
    private routerQuery: RouterQuery
  ) {}

  ngOnInit() {
    // Set need variables.
    this.yesterday.setDate(this.today.getDate() - 1);
    this.organizationName = this.organizationQuery.getActive().name;
    this.app = this.routerQuery.getValue().state.root.data.app;

    // Create a specific invitation store for this component.
    const storeName = this.invitationStore.storeName;
    const queryFn = ref => ref.where('organization.id', '==', this.authQuery.orgId);
    this.sub = this.invitationService.syncCollection(queryFn, { storeName }).subscribe();

    // Populate observables.
    this.notificationsByDate$ = this.notificationQuery.groupNotificationsByDate();
    this.invitationsByDate$ = this.invitationQuery.groupInvitationsByDate()
    this.invitations$ = this.invitationQuery.selectAll();
    this.notifications$ = this.notificationQuery.selectAll();
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }
}
