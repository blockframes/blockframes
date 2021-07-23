import { Injectable } from '@angular/core';
import { CollectionConfig, CollectionService } from 'akita-ng-fire';
import { AnalyticsState, AnalyticsStore } from './analytics.store';

@Injectable({ providedIn: 'root' })
@CollectionConfig({ path: 'analytics' })
export class AnalyticsService extends CollectionService<AnalyticsState> {
  readonly useMemorization = true;

  constructor(
    protected store: AnalyticsStore
  ) {
    super(store)
  }

}