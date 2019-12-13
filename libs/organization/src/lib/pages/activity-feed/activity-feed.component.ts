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
import { OrganizationQuery } from '@blockframes/organization';
import { RouterQuery } from '@datorama/akita-ng-router-store';
import { Invitation } from '@blockframes/invitation/types';
import { MatSnackBar } from '@angular/material';
import { map } from 'rxjs/operators';

/** Compare two dates and return true if they are the same. */
function sameDay(dateA: Date, dateB: Date) {
  return (
    dateA.getFullYear() === dateB.getFullYear() &&
    dateA.getMonth() === dateB.getMonth() &&
    dateA.getDate() === dateB.getDate()
  );
}

@Component({
  selector: 'notification-activity-feed',
  templateUrl: './activity-feed.component.html',
  styleUrls: ['./activity-feed.component.scss'],
  providers: [InvitationQuery, InvitationStore],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ActivityFeedComponent implements OnInit, OnDestroy {
  public notifications$: Observable<Notification[]>;
  public todayInvitations$: Observable<Invitation[]>;
  public yesterdayInvitations$: Observable<Invitation[]>;
  public olderInvitations$: Observable<Invitation[]>;
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
    private routerQuery: RouterQuery,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    this.yesterday.setDate(this.today.getDate() - 1);
    this.organizationName = this.organizationQuery.getActive().name;
    this.app = this.routerQuery.getValue().state.root.data.app;
    const storeName = this.invitationStore.storeName;
    const queryFn = ref =>
      ref.where('organization.id', '==', this.authQuery.orgId).where('status', '==', 'pending');
    this.sub = this.invitationService.syncCollection(queryFn, { storeName }).subscribe();

    this.notifications$ = this.notificationQuery.selectAll();
    this.todayInvitations$ = this.invitationQuery.selectAll({
      filterBy: invit => sameDay(invit.date.toDate(), this.today)
    });
    this.yesterdayInvitations$ = this.invitationQuery.selectAll({
      filterBy: invit => sameDay(invit.date.toDate(), this.yesterday)
    });
    this.olderInvitations$ = this.invitationQuery.selectAll({
      filterBy: invit =>
        !sameDay(invit.date.toDate(), this.today) && !sameDay(invit.date.toDate(), this.yesterday)
    });
    this.invitations$ = this.invitationQuery.selectAll();
  }

  public acceptInvitation(invitation: Invitation) {
    try {
      this.invitationService.acceptInvitation(invitation);
      this.snackBar.open('You accepted the invitation!', 'close', { duration: 5000 });
    } catch (error) {
      this.snackBar.open(error.message, 'close', { duration: 5000 });
    }
  }

  public declineInvitation(invitation: Invitation) {
    try {
      this.invitationService.declineInvitation(invitation);
      this.snackBar.open('You declined the invitation.', 'close', { duration: 5000 });
    } catch (error) {
      this.snackBar.open(error.message, 'close', { duration: 5000 });
    }
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }
}
