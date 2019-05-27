import { Injectable } from '@angular/core';
import { FireQuery, Query } from '@blockframes/utils';
import { switchMap, tap, filter } from 'rxjs/operators';
import { NotificationStore } from './notification.store';
import { AuthQuery } from '@blockframes/auth';
import { Notification } from './notification.model';
import { Stakeholder } from '@blockframes/movie';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  constructor(
    private authQuery: AuthQuery,
    private store: NotificationStore,
    private db: FireQuery
  ) {}

  // TODO : move this in /layout guard
  public get userNotifications() {
    return this.authQuery.user$.pipe(
      filter(user => !!user),
      switchMap(user => this.db.fromQuery(this.getNotificationsByUserId(user.uid))),
      tap((notifications: any) => this.store.set(notifications)) // TODO : Find a way to cast notifications as Notification[];
    );
  }

  // TODO : move this in /layout guard
  private getNotificationsByUserId(userId: string): Query<Notification> {
    return {
      path: `notifications`,
      queryFn: ref => ref.where('userId', '==', userId)
    };
  }

  public readNotification(id: string) {
    return this.db.doc<Notification>(`notifications/${id}`).update({ isRead: true });
  }

  public joinTeamwork(stakeholderId: string, id: string, type: string) {
    const collectionName = (type === 'delivery') ? 'deliveries' : 'movies';
    return this.db
      .doc<Stakeholder>(`${collectionName}/${id}/stakeholders/${stakeholderId}`)
      .update({ isAccepted: true })
      .then(() => {
        if (collectionName === 'movies') { // @todo move this to a function
          return this.addMovieToOrg(stakeholderId, collectionName, id);
        }
      })
  }

  private addMovieToOrg(stakeholderId: string, collectionName: string, movieId: string) {
    return this.db
      .doc<Stakeholder>(`${collectionName}/${movieId}/stakeholders/${stakeholderId}`).get().toPromise()
      .then(sh => sh.data().orgId)
      .then( orgId => this.db.collection('orgs').doc(orgId).get().toPromise())
      .then( org => {
        const movieIds = org.data().movieIds || [];
        if( !movieIds.includes(movieId) ) {
          return org.ref.update({ movieIds : [...movieIds, movieId] });
        }
      })
  }
}
