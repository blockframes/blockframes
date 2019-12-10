import { ChangeDetectionStrategy, Component, OnInit, OnDestroy } from '@angular/core';
import { Observable, combineLatest, Subscription } from 'rxjs';
import { map } from 'rxjs/operators';
import { Activity, createActivity } from './activity.model';
import { NotificationQuery, InvitationQuery, InvitationStore, InvitationService} from '@blockframes/notification'
import { AuthQuery } from '@blockframes/auth';
import { OrganizationQuery } from '@blockframes/organization';

@Component({
  selector: 'notification-activity-feed',
  templateUrl: './activity-feed.component.html',
  styleUrls: ['./activity-feed.component.scss'],
  providers: [InvitationQuery, InvitationStore],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ActivityFeedComponent implements OnInit, OnDestroy{
  public activities$: Observable<Activity[]>;
  public organizationName: string;
  private sub: Subscription;

  constructor(
    private notificationQuery: NotificationQuery,
    private invitationQuery: InvitationQuery,
    private invitationStore: InvitationStore,
    private invitationService: InvitationService,
    private organizationQuery: OrganizationQuery,
    private authQuery: AuthQuery,
  ){}

  ngOnInit() {
    this.organizationName = this.organizationQuery.getActive().name;
    const storeName = this.invitationStore.storeName;
    const queryFn = ref => ref.where('organization.id', '==', this.authQuery.orgId).where('status', '==', 'pending');
    this.sub = this.invitationService.syncCollection(queryFn, { storeName }).subscribe();

    this.activities$ = combineLatest([
      this.notificationQuery.selectAll(),
      this.invitationQuery.selectAll()
    ]).pipe(
      map(([notifications, invitations]) => {
        const activities = [];
        notifications.forEach(notification => activities.push(createActivity(notification)))
        invitations.forEach(invitation => activities.push(createActivity(invitation)))
        console.log(activities)
        return activities;
      })
    )
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }
}
