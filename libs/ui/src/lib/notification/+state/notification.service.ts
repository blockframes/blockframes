import { Injectable } from '@angular/core';
import { FireQuery, Query } from '@blockframes/utils';
import { switchMap, tap, filter } from 'rxjs/operators';
import { NotificationStore } from './notification.store';
import { AuthQuery } from '@blockframes/auth';
import { AngularFirestore } from '@angular/fire/firestore';
import { Notification } from './notification.model';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  constructor(
    private authQuery: AuthQuery,
    private fireQuery: FireQuery,
    private store: NotificationStore,
    private db: AngularFirestore
  ) {}

  public get userNotifications() {
    return this.authQuery.user$.pipe(
      filter(user => !!user),
      switchMap(user => this.fireQuery.fromQuery(this.getNotificationsByUserId(user.uid))),
      tap((notifications: any) => this.store.set(notifications)) //TODO: Find a way to cast notifications as Notification[];
    );
  }

  private getNotificationsByUserId(userId: string): Query<Notification> {
    return {
      path: `notifications`,
      queryFn: ref => ref.where('userId', '==', userId)
    };
  }

  public readNotification(id: string) {
    return this.db
      .doc<Notification>(`notifications/${id}`)
      .update({ isRead: true });
  }
}
