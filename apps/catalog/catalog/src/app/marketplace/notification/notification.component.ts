import { Component, ChangeDetectionStrategy } from '@angular/core';
import { NotificationQuery } from '@blockframes/notification/+state/notification.query';
import { map } from 'rxjs/operators';
import { NotificationService } from '@blockframes/notification/+state';

@Component({
  selector: 'catalog-marketplace-notification',
  templateUrl: './notification.component.html',
  styleUrls: ['./notification.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NotificationComponent {

  public hasNotifications$ = this.query.selectCount().pipe(map(count => !!count))
  public notifications$ = this.query.selectAll();

  constructor(private query: NotificationQuery, private service: NotificationService) { }

  markAll() {
    for (const notification of this.query.getAll()) {
      this.service.readNotification(notification);
    }
  }
}
