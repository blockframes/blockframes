import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { Observable } from 'rxjs';
import { Order } from '@datorama/akita';
import { NotificationQuery, Notification } from '../+state';

@Component({
  selector: 'notification-list',
  templateUrl: './notification-list.component.html',
  styleUrls: ['./notification-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NotificationListComponent implements OnInit {
  public notifications$: Observable<Notification[]>

  constructor(private query: NotificationQuery) {}

  ngOnInit() {
    this.notifications$ = this.query.selectAll({
      sortBy: 'date',
      sortByOrder: Order.DESC
    });
  }
}
