import { Injectable } from '@angular/core';
import { ActiveState, EntityState } from '@datorama/akita';
import { CollectionConfig, CollectionService } from 'akita-ng-fire';
import { Analytics, AnalyticsTypes } from './analytics.firestore';
import { toDate } from '@blockframes/utils/helpers';

interface AnalyticsState extends EntityState<Analytics>, ActiveState<string> {};

@Injectable({ providedIn: 'root' })
@CollectionConfig({ path: 'analytics' })
export class AnalyticsService extends CollectionService<AnalyticsState> {
  readonly useMemorization = true;

  constructor() {
    super();
  }

  formatFromFirestore(analytic): Analytics<AnalyticsTypes> {
    analytic._meta.createdAt = toDate(analytic._meta.createdAt);
    return analytic;
  }
}
