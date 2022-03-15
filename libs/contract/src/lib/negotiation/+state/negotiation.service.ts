import { Injectable } from "@angular/core";
import { EntityState, ActiveState, StoreConfig, EntityStore } from "@datorama/akita";
import { CollectionConfig, CollectionService } from "akita-ng-fire";
import { Negotiation } from "./negotiation.firestore";
import type firebase from 'firebase';
import { formatDocumentMetaFromFirestore } from "@blockframes/utils/models-meta";
import { BucketTerm } from "@blockframes/model";

interface NegotiationState extends EntityState<Negotiation, string>, ActiveState<string> { }

@Injectable({ providedIn: 'root' })
@CollectionConfig({ path: 'contracts/:contractId/negotiations' })
export class NegotiationService extends CollectionService<NegotiationState> {
  useMemorization = true;
  constructor(store: NegotiationStore) {
    super(store)
  }

  formatDocumentDurationFromFirestore(terms: BucketTerm<firebase.firestore.Timestamp>[]) {
    return terms.map(term => {
      const duration = {
        from: term.duration.from.toDate(),
        to: term.duration.to.toDate(),
      };
      return { ...term, duration }
    })
  }

  formatFromFirestore(_negotiation: Negotiation<firebase.firestore.Timestamp>): Negotiation<Date> {
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
