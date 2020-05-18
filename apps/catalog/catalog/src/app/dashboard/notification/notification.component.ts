import { Component, ChangeDetectionStrategy } from '@angular/core';
import { ActivityTab } from '@blockframes/notification/activity-feed/activity-tabs/activity-tabs.component';
import { map } from 'rxjs/operators';
import { NotificationQuery } from '@blockframes/notification/+state/notification.query';

// App specific tabs
const appTabs: ActivityTab[] = [{
  label: 'Offers and Deals',
  filters: ['newContract', 'contractInNegotiation']
}]

@Component({
  selector: 'catalog-dashboard-notification',
  templateUrl: './notification.component.html',
  styleUrls: ['./notification.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NotificationComponent {

  public applicationTabs = appTabs;
  public hasNotifications$ = this.query.selectCount().pipe(map(count => !!count))
  public notifications$ = this.query.selectAll();

  constructor(private query: NotificationQuery) {}
}
