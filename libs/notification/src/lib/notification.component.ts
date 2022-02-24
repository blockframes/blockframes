import { Component, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { NotificationService } from './+state';
import { DynamicTitleService } from '@blockframes/utils/dynamic-title/dynamic-title.service';
import { OrganizationService } from '@blockframes/organization/+state';
import { ActivatedRoute, Router } from '@angular/router';
import { getCurrentApp, getOrgModuleAccess } from '@blockframes/utils/apps';
import { take } from 'rxjs/operators';

@Component({
  selector: 'notification-view',
  templateUrl: './notification.component.html',
  styleUrls: ['./notification.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NotificationComponent implements OnInit {

  public notifications$ = this.service.myNotifications$;

  constructor(
    private service: NotificationService,
    private dynTitle: DynamicTitleService,
    private router: Router,
    private route: ActivatedRoute,
    private orgService: OrganizationService,
  ) { }

  ngOnInit() {
    this.dynTitle.setPageTitle('Notifications');
  }

  async markAll() {
    const myNotifications = await this.service.myNotifications$.pipe(take(1)).toPromise();
    for (const notification of myNotifications) {
      this.service.readNotification(notification);
    }
  }

  leadToHomepage() {
    const app = getCurrentApp(this.route);
    const org = this.orgService.org;
    const [moduleAccess = 'dashboard'] = getOrgModuleAccess(org, app);
    return this.router.navigate([`/c/o/${moduleAccess}/home`]);
  }

}
