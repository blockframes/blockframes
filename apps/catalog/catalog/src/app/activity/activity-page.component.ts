import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NotificationQuery } from '@blockframes/notification';
import { map, distinctUntilChanged } from 'rxjs/operators';
import { ActivityTab } from '@blockframes/notification/activity-feed/activity-tabs/activity-tabs.component';
import { NotificationType } from '@blockframes/notification/types';

@Component({
  selector: 'catalog-activity-page',
  templateUrl: './activity-page.component.html',
  styleUrls: ['./activity-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ActivityPageComponent {

  // App specific tabs
  public applicationTabs: ActivityTab[] = [
    {
      label: 'Offers and Deals',
      filters: [NotificationType.newContract, NotificationType.contractInNegotiation]
    }
  ]

  public hasKey$ = this.notificationQuery.groupNotificationsByDate().pipe(
    map(notifications => !!Object.keys(notifications).length),
    distinctUntilChanged()
  );

  constructor(private notificationQuery: NotificationQuery) {}
}
