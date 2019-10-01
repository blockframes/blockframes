import { Injectable } from '@angular/core';
import { NotificationStore, NotificationState } from './notification.store';
import { AuthQuery } from '@blockframes/auth';
import { CollectionConfig, CollectionService, syncQuery, Query } from 'akita-ng-fire';

const notificationsQuery = (userId: string): Query<Notification> => ({
  path: 'notifications',
  queryFn: ref => ref.where('userId', '==', userId)
});

@Injectable({
  providedIn: 'root'
})
@CollectionConfig({ path: 'notifications'})
export class NotificationService extends CollectionService<NotificationState> {
  syncQuery = syncQuery.bind(this, notificationsQuery(this.authQuery.userId));

  constructor(
    private authQuery: AuthQuery,
    store: NotificationStore
  ) {
    super(store)
  }

  public readNotification(id: string) {
    this.update({id, ...{isRead: true}});
  }

}
