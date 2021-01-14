import { Injectable } from '@angular/core';
import { EntityStore, StoreConfig, EntityState, ActiveState } from '@datorama/akita';
import { Consents } from './consents.firestore';
export interface ConsentsState extends EntityState<Consents<Date>, string>, ActiveState<string> {}

@Injectable({ providedIn: 'root' })
@StoreConfig({ name: 'consents', idKey: 'id' })
export class ConsentsStore extends EntityStore<ConsentsState> {
  analytics = new EntityStore<ConsentsState>({ ids: [], entities: {} }, { name: 'movieAnalytics', idKey: 'movieId' });

  constructor() {
    super();
  }
}
