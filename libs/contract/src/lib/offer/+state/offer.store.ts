import { Injectable } from '@angular/core';
import { Offer } from './offer.model';
import { EntityState, ActiveState, EntityStore, StoreConfig } from '@datorama/akita';

export interface OfferState extends EntityState<Offer>, ActiveState<string> { }

@Injectable({ providedIn: 'root' })
@StoreConfig({ name: 'offers' })
export class OfferStore extends EntityStore<OfferState> {

  constructor() {
    super();
  }

}

