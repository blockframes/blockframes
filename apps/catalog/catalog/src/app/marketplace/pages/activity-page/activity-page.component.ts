import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NotificationQuery } from '@blockframes/notification';
import { map, distinctUntilChanged } from 'rxjs/operators';
import { RouterQuery } from '@datorama/akita-ng-router-store';

@Component({
  selector: 'catalog-activity-page',
  templateUrl: './activity-page.component.html',
  styleUrls: ['./activity-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ActivityPageComponent {

  // Filters (arrays of notification types)
  public dealFilters = ['newContract', 'contractInNegotiation'];

  public allNotifications$ = this.notificationQuery.groupNotificationsByDate();

  public hasKey$ = this.allNotifications$.pipe(
    map(notifications => !!Object.keys(notifications).length),
    distinctUntilChanged()
  );

  constructor(private notificationQuery: NotificationQuery) {}
}
