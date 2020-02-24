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

  public getInformation(notification: Notification) {
    return this.query.createNotificationInformation(notification)
  }

  public readNotification(notification: Notification) {
    this.service.readNotification(notification);
    const path = this.getInformation(notification).url;
    if (path) {
      return this.router.navigateByUrl(path);
    }
  }

}
