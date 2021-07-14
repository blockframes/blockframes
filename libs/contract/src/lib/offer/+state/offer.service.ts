import { Injectable } from '@angular/core';
import { OfferStore, OfferState } from './offer.store';
import { CollectionConfig, CollectionService } from 'akita-ng-fire';
import { formatDocumentMetaFromFirestore } from "@blockframes/utils/models-meta";

@Injectable({ providedIn: 'root' })
@CollectionConfig({ path: 'offers' })
export class OfferService extends CollectionService<OfferState> {
  useMemorization=true;

  constructor(store: OfferStore) {
    super(store);
  }

  formatFromFirestore(offer) {
    if (!offer) return;
    return {
      ...offer,
      _meta: formatDocumentMetaFromFirestore(offer?._meta)
    };
  }
}
