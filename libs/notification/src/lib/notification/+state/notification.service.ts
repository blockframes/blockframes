import { Injectable } from '@angular/core';
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

  public readNotification(id: string) {
    this.update(id, { isRead: true });
  }
}
