import { Injectable } from '@angular/core';
import { ContractStore, ContractState } from './contract.store';
import { CollectionConfig, CollectionService } from 'akita-ng-fire';
import { ContractDocument, convertDuration, createMandate, createSale, Holdback, Mandate, Sale } from './contract.model';
import { createDocumentMeta, formatDocumentMetaFromFirestore } from "@blockframes/utils/models-meta";
import { Timestamp } from "@blockframes/utils/common-interfaces/timestamp";
import { NegotiationService } from '@blockframes/contract/negotiation/+state/negotiation.service';
import { first, map } from 'rxjs/operators';
import { QueryFn } from '@angular/fire/firestore';
import { OrganizationQuery } from '@blockframes/organization/+state';
import { Negotiation } from '@blockframes/contract/negotiation/+state/negotiation.firestore';
import { centralOrgId } from '@env';

@Injectable({ providedIn: 'root' })
@CollectionConfig({ path: 'contracts' })
export class ContractService extends CollectionService<ContractState> {
  useMemorization = true;

  constructor(
    store: ContractStore,
    private orgQuery: OrganizationQuery,
    private negotiationService: NegotiationService,
  ) {
    super(store);
  }

  /**
   * This converts the ContractDocument into an Organization
   * @param contract
   */
  formatFromFirestore(contract: ContractDocument): Sale | Mandate {
    const convertHoldback = (holdback: Holdback<Timestamp>): Holdback<Date> => ({
      ...holdback,
      duration: convertDuration(holdback.duration)
    });
    const _meta = formatDocumentMetaFromFirestore(contract?._meta);

    return contract.type === 'mandate' ?
      createMandate({ ...contract, _meta }) :
      createSale({ ...contract, _meta, holdbacks: contract.holdbacks?.map(convertHoldback) ?? [] })
      ;
  }

  /** Return the last negotiation of the contractId */
  lastNegotiation(contractId: string) {
    const options = { params: { contractId } };
    const orgId = this.orgQuery.getActiveId();
    const query: QueryFn = ref => ref.where('stakeholders', 'array-contains', orgId).orderBy('_meta.createdAt', 'desc').limit(1);
    return this.negotiationService.valueChanges(query, options).pipe(
      map(negotiations => negotiations[0])
    );
  }


  addNegotiation(contractId: string, contract: Partial<Negotiation>) {
    const activeOrgId = this.orgQuery.getActiveId();

    return this.negotiationService.add({
      _meta: createDocumentMeta({ createdAt: new Date(), }),
      status: 'pending',
      createdByOrg: activeOrgId,
      sellerId: centralOrgId.catalog,
      stakeholders: contract.stakeholders,
      buyerId: contract.orgId,
      price: contract.price,
      currency: contract.currency,
      titleId: contract.titleId,
      terms: contract.terms,
      parentTermId: contract.parentTermId,
      initial: contract.initial,
      orgId: contract.orgId,
    }, { params: { contractId }});
  }
}
