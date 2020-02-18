import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import {
  NotificationQuery,
  InvitationQuery,
  InvitationStore
} from '@blockframes/notification';
import { Organization } from '@blockframes/organization/+state/organization.model'
import { OrganizationQuery } from '@blockframes/organization/+state/organization.query';
import { RouterQuery } from '@datorama/akita-ng-router-store';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';;

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
    private organizationQuery: OrganizationQuery,
    private routerQuery: RouterQuery
  ) {}

  ngOnInit() {
    this.organization = this.organizationQuery.getActive();
    this.app = this.routerQuery.getValue().state.root.data.app;
    this.notificationsLabel$ = this.notificationQuery
      .selectCount()
      .pipe(map(lenght => `All (${lenght})`));
  }
}
