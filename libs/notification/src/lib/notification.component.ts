import { Component, ChangeDetectionStrategy, OnInit, Inject } from '@angular/core';
import { NotificationService } from './+state';
import { DynamicTitleService } from '@blockframes/utils/dynamic-title/dynamic-title.service';
import { OrganizationService } from '@blockframes/organization/service';
import { Router } from '@angular/router';
import { App, getOrgModuleAccess } from '@blockframes/model';
import { APP } from '@blockframes/utils/routes/utils';
import { firstValueFrom } from 'rxjs';

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
    private orgService: OrganizationService,
    @Inject(APP) private app: App
  ) { }

  ngOnInit() {
    this.dynTitle.setPageTitle('Notifications');
  }

  async markAll() {
    const myNotifications = await firstValueFrom(this.service.myNotifications$);
    for (const notification of myNotifications) {
      this.service.readNotification(notification);
    }
  }

  leadToHomepage() {
    const org = this.orgService.org;
    const [moduleAccess = 'dashboard'] = getOrgModuleAccess(org, this.app);
    return this.router.navigate([`/c/o/${moduleAccess}/home`]);
  }

}
