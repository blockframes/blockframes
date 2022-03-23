import { Injectable } from '@angular/core';
import { MovieAnalytics } from '@blockframes/model';
import { ActiveState, EntityState } from '@datorama/akita';
import { CollectionConfig, CollectionService } from 'akita-ng-fire';

interface AnalyticsState extends EntityState<MovieAnalytics, string>, ActiveState<string> {}

@Injectable({ providedIn: 'root' })
@CollectionConfig({ path: 'analytics' })
export class AnalyticsService extends CollectionService<AnalyticsState> {
  readonly useMemorization = false;
}
