import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { DateGroup } from '@blockframes/utils/helpers';
import { Router } from '@angular/router';
import { Notification } from '../+state/notification.model';
import { NotificationService } from '../+state/notification.service';

@Component({
  selector: 'notification-list',
  templateUrl: './notification-list.component.html',
  styleUrls: ['./notification-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NotificationListComponent {
  @Input() notificationsByDate: DateGroup<Notification[]>;

  public today: Date = new Date();
  public yesterday = new Date().setDate(this.today.getDate() - 1);

  constructor(
    private service: NotificationService,
    private router: Router
  ) {}


  public goToPath(notification: Notification) {
    this.service.readNotification(notification);
    if (notification.url) {
      return this.router.navigateByUrl(notification.url);
    }
  }
}
