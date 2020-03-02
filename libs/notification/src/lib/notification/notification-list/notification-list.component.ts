import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { Notification, NotificationService } from '../+state';
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

  constructor(
    private service: NotificationService,
    private router: Router
  ) {}

  public goToPath(notification: Notification) {
    this.service.readNotification(notification);
    const path = notification.url;
    if (path) {
      return this.router.navigateByUrl(path);
    }
  }
}
