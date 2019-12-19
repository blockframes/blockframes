import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import {
  Notification,
  NotificationQuery,
  InvitationQuery,
  InvitationStore
} from '@blockframes/notification';
import { RouterQuery } from '@datorama/akita-ng-router-store';
import { Invitation, InvitationStatus } from '@blockframes/invitation/types';
import { OrganizationQuery } from '../../+state/organization.query';
import { map } from 'rxjs/operators';
import { Organization } from '@blockframes/organization/+state/organization.model';

@Component({
  selector: 'notification-activity-feed',
  templateUrl: './activity-feed.component.html',
  styleUrls: ['./activity-feed.component.scss'],
  providers: [InvitationQuery, InvitationStore],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ActivityFeedComponent implements OnInit {
  public notificationsLabel$: Observable<string>;
  public invitationsLabel$: Observable<string>;

  public organization: Organization;
  public app: string;

  constructor(
    private notificationQuery: NotificationQuery,
    private invitationQuery: InvitationQuery,
    private organizationQuery: OrganizationQuery,
    private routerQuery: RouterQuery
  ) {}

  ngOnInit() {
    this.organization = this.organizationQuery.getActive();
    this.app = this.routerQuery.getValue().state.root.data.app;
    this.invitationsLabel$ = this.invitationQuery
      .selectCount(
        invitation =>
          invitation.status === InvitationStatus.pending &&
          invitation.organization.id === this.organization.id
      )
      .pipe(map(lenght => `${this.organization.name} (${lenght})`));
    this.notificationsLabel$ = this.notificationQuery
      .selectCount()
      .pipe(map(lenght => `All (${lenght})`));
  }
}
