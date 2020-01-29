import { Component, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { NotificationQuery, Notification, NotificationService } from '../+state';
import { Observable } from 'rxjs';
import { DateGroup } from '@blockframes/utils/helpers';
import { Router } from '@angular/router';
import { NotificationType } from '@blockframes/notification/types';

@Component({
  selector: 'notification-list',
  templateUrl: './notification-list.component.html',
  styleUrls: ['./notification-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NotificationListComponent implements OnInit {
  public notificationsByDate$: Observable<DateGroup<Notification[]>>;
  public theme$: Observable<string>;

  public today: Date = new Date();
  public yesterday: Date = new Date();

  constructor(
    private service: NotificationService,
    private query: NotificationQuery,
    private router: Router,
  ) {}

  ngOnInit() {
    this.yesterday.setDate(this.today.getDate() - 1);
    this.notificationsByDate$ = this.query.groupNotificationsByDate();
  }

  public goToPath(notification: Notification) {
    try {
      const path = notification.type === NotificationType.pathToDocument
        ? `c/o/delivery/${notification.movie.id}/${notification.docId}/list`
        : `c/o/delivery/${notification.movie.id}/${notification.docId}/stakeholders`;
      this.router.navigateByUrl(path);
      this.service.readNotification(notification);
    } catch (error) {
      throw new Error(error.message);
    }
  }

}
