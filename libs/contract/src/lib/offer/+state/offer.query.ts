import { Injectable } from '@angular/core';
import { QueryEntity } from '@datorama/akita';
import { OfferStore, OfferState } from './offer.store';

@Injectable({ providedIn: 'root' })
export class OfferQuery extends QueryEntity<OfferState> {

  constructor(protected store: OfferStore) {
    super(store);
  }
}
