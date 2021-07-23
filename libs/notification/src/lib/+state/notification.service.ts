import { Injectable } from '@angular/core';
import { Notification } from './notification.model';
import { NotificationStore, NotificationState } from './notification.store';
import { CollectionConfig, CollectionService } from 'akita-ng-fire';

@Injectable({ providedIn: 'root' })
@CollectionConfig({ path: 'notifications' })
export class NotificationService extends CollectionService<NotificationState> {
  readonly useMemorization = true;
  constructor(protected store: NotificationStore) {
    super(store);
  }

  public readNotification(notification: Partial<Notification>) {
    return this.update({
      id: notification.id,
      app: { isRead: true }
    });
  }

  formatFromFirestore(notification: Notification): Notification {
    return {
      ...notification,
      ...this.store.formatNotification(notification),
    };
  }
}
