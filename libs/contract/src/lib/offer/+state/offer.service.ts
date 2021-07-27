import { Injectable } from '@angular/core';
import { OfferStore, OfferState } from './offer.store';
import { CollectionConfig, CollectionService, Query, queryChanges } from 'akita-ng-fire';
import { formatDocumentMetaFromFirestore } from "@blockframes/utils/models-meta";
import { Offer } from './offer.model';
import { Contract } from '../../contract/+state';
import { Income } from '../..//income/+state';
import { QueryFn } from '@angular/fire/firestore';
import { Observable } from 'rxjs';

export type OfferWithContracts = Offer & { contracts: (Contract & { income: Income })[] };

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

  queryWithContracts(queryFn?: QueryFn): Observable<OfferWithContracts[]> {
    return queryChanges.call(this, {
      path: 'offers',
      queryFn,
      contracts: (offer: Offer) => ({
        path: 'contracts',
        queryFn: ref => ref.where('offerId', '==', offer.id),
        income: (contract: Contract) => ({
          path: `incomes/${contract.id}`,
        })
      }),
    } as Query<OfferWithContracts>);
  }
}
