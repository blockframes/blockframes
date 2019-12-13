import { ChangeDetectionStrategy, Component, OnInit, OnDestroy } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { Notification, NotificationQuery, InvitationQuery, InvitationStore, InvitationService} from '@blockframes/notification'
import { AuthQuery } from '@blockframes/auth';
import { OrganizationQuery } from '@blockframes/organization';
import { RouterQuery } from '@datorama/akita-ng-router-store';
import { Invitation } from '@blockframes/invitation/types';

@Component({
  selector: 'notification-activity-feed',
  templateUrl: './activity-feed.component.html',
  styleUrls: ['./activity-feed.component.scss'],
  providers: [InvitationQuery, InvitationStore],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ActivityFeedComponent implements OnInit, OnDestroy{
  public notifications$: Observable<Notification[]>;
  public invitations$: Observable<Invitation[]>;
  public organizationName: string;
  public app: string;
  private sub: Subscription;

  constructor(
    private notificationQuery: NotificationQuery,
    private invitationQuery: InvitationQuery,
    private invitationStore: InvitationStore,
    private invitationService: InvitationService,
    private organizationQuery: OrganizationQuery,
    private authQuery: AuthQuery,
    private routerQuery: RouterQuery
  ){}

  ngOnInit() {
    this.organizationName = this.organizationQuery.getActive().name;
    this.app = this.routerQuery.getValue().state.root.data.app;
    const storeName = this.invitationStore.storeName;
    const queryFn = ref => ref.where('organization.id', '==', this.authQuery.orgId).where('status', '==', 'pending');
    this.sub = this.invitationService.syncCollection(queryFn, { storeName }).subscribe();

    this.notifications$ = this.notificationQuery.selectAll();
    this.invitations$ = this.invitationQuery.selectAll();
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }
}
