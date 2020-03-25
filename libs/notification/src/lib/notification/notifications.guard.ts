import { Injectable } from '@angular/core';
import { CollectionGuard, CollectionGuardConfig } from 'akita-ng-fire';
import { AuthQuery } from '@blockframes/auth/+state/auth.query';
import { NotificationState } from './+state/notification.store';
import { NotificationService } from './+state/notification.service';

@Injectable({ providedIn: 'root' })
@CollectionGuardConfig({ awaitSync: true })
export class NotificationsGuard extends CollectionGuard<NotificationState> {
  constructor(service: NotificationService, private authQuery: AuthQuery) {
    super(service);
  }

  /** This sync on notifications where userId is the same as the connected user id */
  sync() {
    return this.service.syncCollection(ref => ref.where('userId', '==', this.authQuery.userId));
  }
}
