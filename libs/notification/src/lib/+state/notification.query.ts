import { Injectable } from '@angular/core';
import { QueryEntity, QueryConfig, Order } from '@datorama/akita';
import { Notification } from './notification.model';
import { NotificationStore, NotificationState } from './notification.store';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { DateGroup } from '@blockframes/utils/helpers';
import { formatDate } from '@angular/common';
import { MovieQuery } from '@blockframes/movie/+state/movie.query';
import { NotificationType } from './notification.firestore';
import { HostedMedia, createHostedMedia } from '@blockframes/media/+state/media.firestore';
import { toDate } from 'date-fns';

function getYesterday() {
  const today = new Date();
  const yesterday = today.setDate(today.getDate() - 1);
  return new Date(yesterday);
}

function isSameDay(target: Date, baseDate: Date) {
  return (
    target.getDate() === baseDate.getDate() &&
    target.getMonth() === baseDate.getMonth() &&
    target.getFullYear() === baseDate.getFullYear()
  );
}
const isToday = (target: Date) => isSameDay(target, new Date());
const isYesterday = (target: Date) => isSameDay(target, getYesterday());

@Injectable({ providedIn: 'root' })
@QueryConfig({ sortBy: 'date', sortByOrder: Order.DESC })
export class NotificationQuery extends QueryEntity<NotificationState, Notification> {
  constructor(protected store: NotificationStore, private movieQuery: MovieQuery) {
    super(store);
  }

  /** Group notifications by date in an object. */
  public groupNotificationsByDate(filter?: string | NotificationType[]): Observable<DateGroup<Notification[]>> {
    return this.selectAll({
      filterBy: notification => (filter && typeof filter !== 'string' ? filter.includes(notification.type) : true)
    }).pipe(
      map(notifications => {
        return notifications.reduce((acc, notification) => {
          // As Date cannot be used as an index type (key), we format the date into a string.
          const key = isToday(notification.date) ? 'Today'
            : isYesterday(notification.date) ? 'Yesterday'
              : formatDate(notification.date, 'MM M dd, yyyy', 'en-US');
          const notif = {
            ...notification,
            date: toDate(notification.date)
          };
          acc[key] = [...(acc[key] || []), notif];
          return acc;
        }, {});
      })
    );
  }

  public getPoster(id: string): HostedMedia {
    const movie = this.movieQuery.getEntity(id);
    return !!movie && movie.main.poster ? movie.main.poster.media : createHostedMedia();
  }
}
