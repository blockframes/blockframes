import { Injectable } from '@angular/core';
import { FireQuery, Query } from '@blockframes/utils';
import { switchMap, tap, filter } from 'rxjs/operators';
import { NotificationStore } from './notification.store';
import { AuthQuery } from '@blockframes/auth';
import { Notification } from './notification.model';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  constructor(
    private authQuery: AuthQuery,
    private store: NotificationStore,
    private db: FireQuery
  ) {}

  // TODO : move this in /layout guard => ISSUE#641
  public get userNotifications$() {
    return this.authQuery.user$.pipe(
      filter(user => !!user),
      switchMap(user => this.db.fromQuery(this.getNotificationsByUserId(user.uid))),
      tap((notifications: Notification[]) => this.store.set(notifications))
    );
  }

  // TODO : move this in /layout guard => ISSUE#641
  private getNotificationsByUserId(userId: string): Query<Notification[]> {
    return {
      path: `notifications`,
      queryFn: ref => ref.where('userId', '==', userId)
    };
  }

  public readNotification(id: string) {
    return this.db.doc<Notification>(`notifications/${id}`).update({ isRead: true });
  }
}
