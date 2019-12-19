import { Component, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { NotificationQuery } from '../+state';
import { Observable } from 'rxjs';

@Component({
  selector: 'notification-list',
  templateUrl: './notification-list.component.html',
  styleUrls: ['./notification-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NotificationListComponent implements OnInit {
  public notificationsByDate$: Observable<{}>;

  public today: Date = new Date();
  public yesterday: Date = new Date();

  constructor(private query: NotificationQuery) {}

  ngOnInit() {
    this.yesterday.setDate(this.today.getDate() - 1);

    this.notificationsByDate$ = this.query.groupNotificationsByDate();
  }
}
