import { Component, OnInit, ChangeDetectionStrategy, OnDestroy } from '@angular/core';
import { takeUntil } from 'rxjs/operators';
import { Observable, Subject } from 'rxjs';
import { Order } from '@datorama/akita';
import { NotificationService, NotificationQuery, Notification } from '../+state';

@Component({
  selector: 'notification-list',
  templateUrl: './notification-list.component.html',
  styleUrls: ['./notification-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NotificationListComponent implements OnInit, OnDestroy {
  public notifications$: Observable<Notification[]>
  private destroyed$ = new Subject();

  constructor(private service: NotificationService, private query: NotificationQuery) {}

  ngOnInit() {
    this.notifications$ = this.query.selectAll({
      sortBy: 'date',
      sortByOrder: Order.DESC
    });
    this.service.userNotifications$.pipe(takeUntil(this.destroyed$)).subscribe();
  }

  ngOnDestroy() {
    this.destroyed$.next();
    this.destroyed$.unsubscribe();
  }
}
