import { Component, ChangeDetectionStrategy } from '@angular/core';
import { map } from 'rxjs/operators';
import { NotificationQuery } from '@blockframes/notification/+state/notification.query';


@Component({
  selector: 'festival-marketplace-notification',
  templateUrl: './notification.component.html',
  styleUrls: ['./notification.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NotificationComponent {

  public hasNotifications$ = this.query.selectCount().pipe(map(count => !!count))
  public notifications$ = this.query.selectAll();

  constructor(private query: NotificationQuery) {}
}
