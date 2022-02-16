import { Injectable } from '@angular/core';
import { ActiveState, EntityState } from '@datorama/akita';
import { CollectionConfig, CollectionService } from 'akita-ng-fire';
import { Analytics } from './analytics.firestore';

interface AnalyticsState extends EntityState<Analytics>, ActiveState<string> {};

@Injectable({ providedIn: 'root' })
@CollectionConfig({ path: 'analytics' })
export class EventService extends CollectionService<AnalyticsState> {
  readonly useMemorization = true;

  constructor() {
    super();    
  }

}
