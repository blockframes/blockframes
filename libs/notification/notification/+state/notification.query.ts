import { Injectable } from '@angular/core';
import { QueryEntity } from '@datorama/akita';
import { Notification } from './notification.model';
import { NotificationStore, NotificationState } from './notification.store';

@Injectable({
  providedIn: 'root'
})
export class NotificationQuery extends QueryEntity<NotificationState, Notification> {
  constructor(protected store: NotificationStore) {
    super(store);
  }
}
