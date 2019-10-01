import { Injectable } from '@angular/core';
import { CollectionGuard, CollectionGuardConfig } from 'akita-ng-fire';
import { NotificationState, NotificationService } from './+state';

@Injectable({ providedIn: 'root' })
@CollectionGuardConfig({ awaitSync: true })
export class NotificationsGuard extends CollectionGuard<NotificationState> {
  constructor(protected service: NotificationService) {
    super(service);
  }

  sync() {
    // This is using the syncQuery from CollectionService to load notifications where
    // the connected user uid is equal to notification.userId
    return this.service.syncQuery()
  }
}
