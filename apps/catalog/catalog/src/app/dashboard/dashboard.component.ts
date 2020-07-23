// Angular
import { Component, ChangeDetectionStrategy } from '@angular/core';
import { InvitationQuery } from '@blockframes/invitation/+state/invitation.query';
import { NotificationQuery } from '@blockframes/notification/+state/notification.query';

@Component({
  selector: 'catalog-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DashboardComponent {
  public invitationCount$ = this.invitationQuery.selectCount(
    invitation => invitation.status === 'pending'
  );
  public notificationCount$ = this.notificationQuery.selectCount();

  constructor(
    private invitationQuery: InvitationQuery,
    private notificationQuery: NotificationQuery
  ) {}

}
