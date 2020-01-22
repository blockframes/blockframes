import { Injectable } from '@angular/core';
import { QueryEntity } from '@datorama/akita';
import { Notification } from './notification.model';
import { NotificationStore, NotificationState } from './notification.store';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { DateGroup } from '@blockframes/utils/helpers';
import { formatDate } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class NotificationQuery extends QueryEntity<NotificationState, Notification> {
  constructor(protected store: NotificationStore) {
    super(store);
  }

  /** Group notifications by date in an object. */
  public groupNotificationsByDate(): Observable<DateGroup<Notification[]>> {
    return this.selectAll().pipe(
      map(notifications => {
        return notifications.reduce((acc, notification) => {
          // As Date cannot be used as an index type (key), we format the date into a string.
          const key = formatDate(notification.date.toDate(), 'MMM dd, yyyy', 'en-US');

          acc[key] = [...(acc[key] || []), notification];
          return acc;
        }, {});
      })
    );
  }
}
