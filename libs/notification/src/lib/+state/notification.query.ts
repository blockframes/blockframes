import { Injectable } from '@angular/core';
import { QueryEntity, QueryConfig, Order } from '@datorama/akita';
import { Notification } from './notification.model';
import { NotificationStore, NotificationState } from './notification.store';
import { MovieQuery } from '@blockframes/movie/+state/movie.query';

@Injectable({ providedIn: 'root' })
@QueryConfig({ sortBy: '_meta.createdAt', sortByOrder: Order.DESC })
export class NotificationQuery extends QueryEntity<NotificationState, Notification> {
  constructor(protected store: NotificationStore, private movieQuery: MovieQuery) {
    super(store);
  }


  public getPoster(id: string) {
    const movie = this.movieQuery.getEntity(id);
    return movie.poster ?? '';
  }
}
