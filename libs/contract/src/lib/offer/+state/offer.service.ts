import { Injectable } from '@angular/core';
import { OfferStore, OfferState } from './offer.store';
import { CollectionConfig, CollectionService } from 'akita-ng-fire';

@Injectable({ providedIn: 'root' })
@CollectionConfig({ path: 'offers' })
export class OfferService extends CollectionService<OfferState> {

  constructor(store: OfferStore) {
    super(store);
  }


}
