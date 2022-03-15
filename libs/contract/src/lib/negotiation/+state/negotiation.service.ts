import { Injectable } from "@angular/core";
import { EntityState, ActiveState, StoreConfig, EntityStore } from "@datorama/akita";
import { CollectionConfig, CollectionService } from "akita-ng-fire";
import type firestore from 'firebase/firestore';
import { formatDocumentMetaFromFirestore } from "@blockframes/utils/models-meta";
import { BucketTerm, Negotiation } from "@blockframes/model";

interface NegotiationState extends EntityState<Negotiation, string>, ActiveState<string> { }

@Injectable({ providedIn: 'root' })
@CollectionConfig({ path: 'contracts/:contractId/negotiations' })
export class NegotiationService extends CollectionService<NegotiationState> {
  useMemorization = true;
  constructor(store: NegotiationStore) {
    super(store)
  }

  formatDocumentDurationFromFirestore(terms:BucketTerm<firestore.Timestamp>[]){
    return terms.map(term => {
      const duration = {
        from: term.duration.from.toDate(),
        to: term.duration.to.toDate(),
      };
      return { ...term, duration }
    })
  }

  formatFromFirestore(_negotiation: Negotiation<firestore.Timestamp>): Negotiation<Date> {
    const _meta = formatDocumentMetaFromFirestore(_negotiation?._meta);
    const terms = this.formatDocumentDurationFromFirestore(_negotiation.terms)
    const initial = _negotiation.initial?.toDate();
    return { ..._negotiation, _meta, initial, terms };
  }
}

// BOILETPLATE
@Injectable({ providedIn: 'root' })
@StoreConfig({ name: 'negotiation' })
class NegotiationStore extends EntityStore<NegotiationState> {
  constructor() {
    super();
  }
}
