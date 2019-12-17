import { Injectable } from '@angular/core';
import { Notification } from './notification.model';
import { NotificationStore, NotificationState } from './notification.store';
import { CollectionConfig, CollectionService } from 'akita-ng-fire';

@Injectable({
  providedIn: 'root'
})
@CollectionConfig({ path: 'notifications' })
export class NotificationService extends CollectionService<NotificationState> {
  constructor(store: NotificationStore) {
    super(store);
  }

  public readNotification(notification: Notification) {
    this.update(notification.id, { ...notification, isRead: true });
  }
}
