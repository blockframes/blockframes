import { Component, ChangeDetectionStrategy, OnInit, Input } from '@angular/core';
import { Observable, combineLatest } from 'rxjs';
import { AuthQuery } from '@blockframes/auth/+state/auth.query';
import { InvitationQuery, InvitationStore, Invitation } from '../../invitation/+state';
import { switchMap, map } from 'rxjs/operators';
import { PermissionsQuery } from 'libs/organization/src/lib/permissions/+state/permissions.query';
import { User } from '@blockframes/auth/+state/auth.store';
import { NotificationQuery } from '../+state/notification.query';
import { InvitationType } from '@blockframes/invitation/+state/invitation.firestore';

@Component({
  selector: 'overlay-notification-widget',
  templateUrl: './notification-widget.component.html',
  styleUrls: ['./notification-widget.component.scss'],
  providers: [InvitationQuery, InvitationStore],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NotificationWidgetComponent implements OnInit {
  @Input() page = 'activity';
  public user$: Observable<User>;
  public notificationCount$: Observable<number>;
  public invitationCount$: Observable<number>;
  public notifications$ = this.notificationQuery.groupNotificationsByDate();

  constructor(
    private authQuery: AuthQuery,
    private notificationQuery: NotificationQuery,
    private invitationQuery: InvitationQuery,
    private permissionQuery: PermissionsQuery
  ) { }

  ngOnInit() {
    this.user$ = this.authQuery.user$;
    this.notificationCount$ = this.notificationQuery.selectCount(notification => !notification.isRead);
    if (!!this.authQuery.orgId) {
      this.invitationCount$ = this.permissionQuery.isAdmin$.pipe(
        switchMap(isAdmin =>
          isAdmin
            ? this.invitationQuery.selectCount(invitation => this.adminInvitations(invitation))
            : this.invitationQuery.selectCount(invitation => this.memberInvitations(invitation))
        )
      );
    } else {
      this.invitationCount$ = this.invitationQuery.selectCount(invitation => this.memberInvitations(invitation));
    }
  }

  /**
   * Returns true if notification should be displayed
   * for an admin.
   *   joinOrganization : An user requested to join an org.
   *   attendEvent: Even org admin can attend to an event (no discrimination!)
   * 
   * @param invitation 
   */
  private adminInvitations(invitation: Invitation) : boolean {
    const invitationTypes: InvitationType[] = ['joinOrganization', 'attendEvent'];
    return (
      invitation.status === 'pending' &&
      invitationTypes.includes(invitation.type)
    );
  }

  /**
   * Returns true if notification should be displayed
   * for an regular user.
   *   joinOrganization : An org invited current user to join in.
   *   attendEvent: Someone invited current user to an event
   * 
   * @param invitation 
   */
  private memberInvitations(invitation: Invitation) : boolean {
    const invitationTypes: InvitationType[] = ['joinOrganization', 'attendEvent'];
    return (
      invitation.status === 'pending' &&
      invitationTypes.includes(invitation.type)
    )
  }

  public get totalCount$() {
    return combineLatest([this.invitationCount$, this.notificationCount$]).pipe(
      map(counts => counts[0] + counts[1])
    );
  }
}
