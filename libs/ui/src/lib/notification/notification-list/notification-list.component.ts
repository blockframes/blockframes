import { Component, OnInit, ChangeDetectionStrategy, OnDestroy } from '@angular/core';
import { NotificationQuery, NotificationService, Notification } from '../+state';
import { takeWhile } from 'rxjs/operators';
import { Observable } from 'rxjs';

@Component({
  selector: 'blockframes-notification-list',
  templateUrl: './notification-list.component.html',
  styleUrls: ['./notification-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NotificationListComponent implements OnInit, OnDestroy {
  public notifications$: Observable<Notification[]>

  public isAlive = true;

  constructor(private service: NotificationService, private query: NotificationQuery) {}

  ngOnInit() {
    this.notifications$ = this.query.selectAll();
    this.service.userNotifications.pipe(takeWhile(_ => (this.isAlive = true))).subscribe();
  }

  ngOnDestroy() {
    this.isAlive = false;
  }
}
