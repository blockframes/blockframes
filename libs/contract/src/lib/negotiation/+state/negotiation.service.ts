import { Injectable } from "@angular/core";
import { EntityState, ActiveState, StoreConfig, EntityStore } from "@datorama/akita";
import { CollectionConfig, CollectionService } from "akita-ng-fire";
import { Negotiation } from "./negotiation.firestore";
import type firebase from 'firebase';
import { formatDocumentMetaFromFirestore } from "@blockframes/utils/models-meta";

export interface NegotiationState extends EntityState<Negotiation, string>, ActiveState<string> { }

@Injectable({ providedIn: 'root' })
@CollectionConfig({ path: 'contracts/:contractId/negotiations' })
export class NegotiationService extends CollectionService<NegotiationState> {
  useMemorization = true;
  constructor(store: NegotiationStore) {
    super(store)
  }

  formatFromFirestore(_negotiation: Negotiation<firebase.firestore.Timestamp>): Negotiation<Date> {
    const _meta = formatDocumentMetaFromFirestore(_negotiation?._meta);
    return { ..._negotiation, _meta };
  }
}

// BOILETPLATE
@Injectable({ providedIn: 'root' })
@StoreConfig({ name: 'negotiation' })
export class NegotiationStore extends EntityStore<NegotiationState> {
  constructor() {
    super();
  }
}
