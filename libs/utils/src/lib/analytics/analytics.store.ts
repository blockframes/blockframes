import { Injectable } from '@angular/core';
import { MovieAnalytics } from '@blockframes/movie/+state/movie.firestore';
import { EntityStore, StoreConfig, EntityState, ActiveState } from '@datorama/akita';

export interface AnalyticsState extends EntityState<MovieAnalytics, string>, ActiveState<string> {}

@Injectable({ providedIn: 'root' })
@StoreConfig({ name: 'analytics', idKey: 'id' })
export class AnalyticsStore extends EntityStore<AnalyticsState> {
  constructor() {
    super()
  }
}
