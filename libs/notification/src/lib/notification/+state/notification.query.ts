import { Injectable } from '@angular/core';
import { QueryEntity } from '@datorama/akita';
import { Notification } from './notification.model';
import { NotificationStore, NotificationState } from './notification.store';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { formatDate } from '@blockframes/utils/helpers';

@Injectable({
  providedIn: 'root'
})
export class NotificationQuery extends QueryEntity<NotificationState, Notification> {
  constructor(protected store: NotificationStore) {
    super(store);
  }

  public groupNotificationsByDate(): Observable<{}> {
    return this.selectAll().pipe(
      map(notifications => {
        return notifications.reduce((acc, notification) => {
          // As Date cannot be used as an index type (key), we format the date into a string.
          const key = formatDate(notification.date.toDate());

          acc[key] = [...(acc[key] || []), notification];
          return acc;
        }, {});
      })
    );
  }
}
