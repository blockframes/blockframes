import { Component, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { NotificationQuery } from './+state/notification.query';
import { NotificationService } from './+state';
import { DynamicTitleService } from '@blockframes/utils/dynamic-title/dynamic-title.service';
import { OrganizationQuery } from '@blockframes/organization/+state';
import { RouterQuery } from '@datorama/akita-ng-router-store';
import { Router } from '@angular/router';
import { getCurrentApp, getOrgModuleAccess } from '@blockframes/utils/apps';

@Component({
  selector: 'notification-view',
  templateUrl: './notification.component.html',
  styleUrls: ['./notification.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NotificationComponent implements OnInit {

  public notifications$ = this.query.selectAll();

  constructor(
    private query: NotificationQuery,
    private service: NotificationService,
    private dynTitle: DynamicTitleService,
    private router: Router,
    private routerQuery: RouterQuery,
    private orgQuery: OrganizationQuery
  ) { }

  ngOnInit() {
    this.dynTitle.setPageTitle('Notifications');
  }

  markAll() {
    for (const notification of this.query.getAll()) {
      this.service.readNotification(notification);
    }
  }

  leadToHomepage() {
    const app = getCurrentApp(this.routerQuery);
    const org = this.orgQuery.getActive();
    const [moduleAccess = 'dashboard'] = getOrgModuleAccess(org, app);
    return this.router.navigate([`/c/o/${moduleAccess}/home`]);
  }

}
