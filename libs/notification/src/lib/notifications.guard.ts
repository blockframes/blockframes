import { Injectable } from '@angular/core';
import { CollectionGuard, CollectionGuardConfig } from 'akita-ng-fire';
import { AuthQuery } from '@blockframes/auth/+state/auth.query';
import { NotificationState } from './+state/notification.store';
import { NotificationService } from './+state/notification.service';
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs';

@Injectable({ providedIn: 'root' })
@CollectionGuardConfig({ awaitSync: false })
export class NotificationsGuard extends CollectionGuard<NotificationState> {
  constructor(service: NotificationService, private authQuery: AuthQuery) {
    super(service);
  }

  /** This sync on notifications where userId is the same as the connected user id */
  sync() {
    return this.service.syncCollection(ref => ref
      .where('toUserId', '==', this.authQuery.userId)
      .where('app.isRead', '==', false)
    ).pipe(catchError(() => of()));
  }
}
