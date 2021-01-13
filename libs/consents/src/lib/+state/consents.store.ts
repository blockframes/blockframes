import { Injectable } from '@angular/core';
import { EntityStore, StoreConfig, EntityState, ActiveState } from '@datorama/akita';
import { access } from 'fs-extra';
import { Access, Share, Consents } from './consents.firestore';
import { createAccess, createConsent } from './consents.model';

export interface ConsentsState extends EntityState<Consents<Date>, string>, ActiveState<string> {}

@Injectable({ providedIn: 'root' })
@StoreConfig({ name: 'consents', idKey: 'id' })
export class ConsentsStore extends EntityStore<ConsentsState> {
  analytics = new EntityStore<ConsentsState>({ ids: [], entities: {} }, { name: 'movieAnalytics', idKey: 'movieId' });

  constructor() {
    super();
  }

  akitaPreAddEntity(consent: Partial<Consents<Date>>) {
    return createConsent(consent);
  }
}
