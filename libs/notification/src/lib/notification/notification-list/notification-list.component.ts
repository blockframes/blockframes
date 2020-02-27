import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { NotificationQuery, Notification, NotificationService } from '../+state';
import { Observable } from 'rxjs';
import { DateGroup } from '@blockframes/utils/helpers';
import { Router } from '@angular/router';

@Component({
  selector: 'notification-list',
  templateUrl: './notification-list.component.html',
  styleUrls: ['./notification-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NotificationListComponent {
  @Input() notificationsByDate: DateGroup<Notification[]>;
  public theme$: Observable<string>;

  public today: Date = new Date();
  public yesterday = new Date().setDate(this.today.getDate() - 1);

  constructor(
    private service: NotificationService,
    private query: NotificationQuery,
    private router: Router
  ) {}

  public getInformation(notification: Notification) {
    return this.query.createNotificationInformation(notification);
  }

  public goToPath(notification: Notification) {
    this.service.readNotification(notification);
    const path = this.getInformation(notification).url;
    if (path) {
      return this.router.navigateByUrl(path);
    }
  }
}
