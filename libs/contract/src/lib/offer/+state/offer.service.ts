import { Injectable } from '@angular/core';
import { CollectionConfig, CollectionService } from 'akita-ng-fire';
import { Offer } from './offer.model';
import { Income } from '../../income/+state';
import { ActiveState, EntityState } from '@datorama/akita';
import { Contract, formatDocumentMetaFromFirestore } from '@blockframes/model';

interface OfferState extends EntityState<Offer>, ActiveState<string> { }

export type OfferWithContracts = Offer & { contracts: (Contract & { income: Income })[] };

@Injectable({ providedIn: 'root' })
@CollectionConfig({ path: 'offers' })
export class OfferService extends CollectionService<OfferState> {
  useMemorization=true;

  formatFromFirestore(offer) {
    if (!offer) return;
    return {
      ...offer,
      _meta: formatDocumentMetaFromFirestore(offer?._meta)
    };
  }
}
