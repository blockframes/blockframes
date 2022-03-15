import { Injectable } from '@angular/core';
import { CollectionConfig, CollectionService } from 'akita-ng-fire';
import { createDocumentMeta, formatDocumentMetaFromFirestore } from "@blockframes/utils/models-meta";
import { Timestamp } from "@blockframes/utils/common-interfaces/timestamp";
import { NegotiationService } from '@blockframes/contract/negotiation/+state/negotiation.service';
import { map } from 'rxjs/operators';
import { OrganizationService } from '@blockframes/organization/+state';
import { centralOrgId } from '@env';
import { ActiveState, EntityState } from '@datorama/akita';
import { ContractDocument, convertDuration, Holdback, Mandate, Sale, createMandate, createSale, Negotiation } from '@blockframes/model';
import { limit, orderBy, where } from 'firebase/firestore';

interface ContractState extends EntityState<Sale | Mandate>, ActiveState<string> { }

@Injectable({ providedIn: 'root' })
@CollectionConfig({ path: 'contracts' })
export class ContractService extends CollectionService<ContractState> {
  useMemorization = true;

  constructor(
    private orgService: OrganizationService,
    private negotiationService: NegotiationService,
  ) {
    super();
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
    const orgId = this.orgService.org.id;
    const query = [where('stakeholders', 'array-contains', orgId), orderBy('_meta.createdAt', 'desc'), limit(1)];
    return this.negotiationService.valueChanges(query, options).pipe(
      map(negotiations => negotiations[0])
    );
  }

  //used exclusively in the crm
  adminLastNegotiation(contractId: string) {
    const options = { params: { contractId } };
    const query = [orderBy('_meta.createdAt', 'desc'), limit(1)];
    return this.negotiationService.valueChanges(query, options).pipe(
      map(negotiations => negotiations[0])
    );
  }

  isInitial(negotiation: Partial<Negotiation>) {
    const initial = negotiation.initial;
    const createdAt = negotiation?._meta?.createdAt;
    if (initial && createdAt) return false;
    return true;
  }

  async addNegotiation(contractId: string, nego: Partial<Negotiation>) {
    const activeOrgId = this.orgService.org.id;
    const write = this.batch();
    this.negotiationService.add({
      _meta: createDocumentMeta({ createdAt: new Date(), }),
      status: 'pending',
      createdByOrg: activeOrgId,
      sellerId: centralOrgId.catalog,
      stakeholders: nego.stakeholders,
      buyerId: nego.buyerId,
      price: nego.price,
      currency: nego.currency,
      titleId: nego.titleId,
      terms: nego.terms,
      parentTermId: nego.parentTermId,
      initial: nego.initial,
      orgId: nego.orgId,
    }, { write, params: { contractId } });

    await write.commit();
  }
}
