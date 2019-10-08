import { Component, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { User, AuthQuery } from '@blockframes/auth';
import { NotificationQuery } from '../notification/+state';
import {
  InvitationQuery,
  InvitationStore,
  InvitationStatus,
  InvitationType
} from '../invitation/+state';
import { switchMap } from 'rxjs/operators';
import { PermissionsQuery } from 'libs/organization/src/lib/permissions/+state/permissions.query';

@Component({
  selector: 'notification-widget',
  templateUrl: './notification-widget.component.html',
  styleUrls: ['./notification-widget.component.scss'],
  providers: [InvitationQuery, InvitationStore],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NotificationWidgetComponent implements OnInit {
  public user$: Observable<User>;
  public notificationCount$: Observable<number>;
  public invitationCount$: Observable<number>;

  constructor(
    private authQuery: AuthQuery,
    private notificationQuery: NotificationQuery,
    private invitationQuery: InvitationQuery,
    private permissionQuery: PermissionsQuery
  ) {}

  ngOnInit() {
    this.user$ = this.authQuery.user$;
    this.notificationCount$ = this.notificationQuery.selectCount(
      notification => !notification.isRead
    );
    this.invitationCount$ = this.permissionQuery.isSuperAdmin$.pipe(
      switchMap(isSuperAdmin => {
        if (!isSuperAdmin) {
          return this.invitationQuery.selectCount(
            invitation =>
              invitation.status === InvitationStatus.pending &&
              invitation.type !== InvitationType.fromOrganizationToUser
          );
        } else {
          return this.invitationQuery.selectCount(
            invitation =>
              invitation.status === InvitationStatus.pending &&
              invitation.type === InvitationType.toWorkOnDocument
          );
        }
      })
    );
  }
}
