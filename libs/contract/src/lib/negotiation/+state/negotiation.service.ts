import { Injectable } from "@angular/core";
import { EntityState, ActiveState, StoreConfig, EntityStore } from "@datorama/akita";
import { CollectionConfig, CollectionService } from "akita-ng-fire";
import { Negotiation } from "./negotiation.firestore";
import type firebase from 'firebase';
import { createDocumentMeta, formatDocumentMetaFromFirestore } from "@blockframes/utils/models-meta";
import { BucketContract } from "@blockframes/contract/bucket/+state";
import { OrganizationQuery } from "@blockframes/organization/+state";
import { Stakeholder } from "@blockframes/utils/common-interfaces";
import { centralOrgId } from "@env";

export interface NegotiationState extends EntityState<Negotiation, string>, ActiveState<string> { }

@Injectable({ providedIn: 'root' })
@CollectionConfig({ path: 'contracts/:contractId/negotiations' })
export class NegotiationService extends CollectionService<NegotiationState> {
  useMemorization = true;
  constructor(
    store: NegotiationStore,
    private orgQuery: OrganizationQuery,
  ) {
    super(store)
  }

  create(contractId: string, contract: Partial<Negotiation>) {
    const activeOrgId = this.orgQuery.getActiveId();
    return this.add({
      _meta: createDocumentMeta({ createdAt: new Date(), }),
      status: 'pending',
      id: this.db.createId(),
      createdByOrg: activeOrgId,
      sellerId: centralOrgId.catalog,
      stakeholders: contract.stakeholders,
      buyerId: contract.orgId,
      price: contract.price,
      titleId: contract.titleId,
      terms: contract.terms,
      holdbacks: contract.holdbacks,
      parentTermId: contract.parentTermId,
      specificity: contract.specificity,
      orgId: contract.orgId,
    }, {
      params: { contractId }
    })
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
