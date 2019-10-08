import { Injectable } from '@angular/core';
import { CollectionGuard, CollectionGuardConfig } from 'akita-ng-fire';
import { NotificationState, NotificationService } from './+state';
import { AuthQuery } from '@blockframes/auth';

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
