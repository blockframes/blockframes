import { Component, ChangeDetectionStrategy } from '@angular/core';
import { map, take } from 'rxjs/operators';
import { NotificationQuery } from '@blockframes/notification/+state/notification.query';
import { NotificationService } from '@blockframes/notification/+state';


@Component({
  selector: 'festival-marketplace-notification',
  templateUrl: './notification.component.html',
  styleUrls: ['./notification.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NotificationComponent {

  public hasNotifications$ = this.query.selectCount().pipe(map(count => !!count))
  public notifications$ = this.query.selectAll();

  constructor(private query: NotificationQuery, private service: NotificationService) {}

  markAll() {
    this.notifications$.pipe(take(1)).subscribe(notifications => notifications.forEach(notification => {
      this.service.readNotification(notification)
    }))
  }
}
