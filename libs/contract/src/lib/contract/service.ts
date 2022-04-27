import { Injectable } from '@angular/core';
import { NegotiationService } from '@blockframes/contract/negotiation/service';
import { map } from 'rxjs/operators';
import { OrganizationService } from '@blockframes/organization/service';
import { centralOrgId } from '@env';
import {
  Mandate,
  Sale,
  createMandate,
  createSale,
  Negotiation,
  createDocumentMeta,
  Contract,
} from '@blockframes/model';
import { DocumentSnapshot, limit, orderBy, where } from 'firebase/firestore';
import { BlockframesCollection } from '@blockframes/utils/abstract-service';

@Injectable({ providedIn: 'root' })
export class ContractService extends BlockframesCollection<Contract> {
  readonly path = 'contracts';

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
  protected fromFirestore(document: DocumentSnapshot<Contract>): Sale | Mandate {
    const contract = super.fromFirestore(document);
    return contract.type === 'mandate' ? createMandate(contract as Mandate) : createSale(contract as Sale);
  }

  /** Return the last negotiation of the contractId */
  lastNegotiation(contractId: string) {
    const orgId = this.orgService.org.id;
    const query = [where('stakeholders', 'array-contains', orgId), orderBy('_meta.createdAt', 'desc'), limit(1)];
    return this.negotiationService.valueChanges(query, { contractId }).pipe(
      map(negotiations => negotiations[0])
    );
  }

  //used exclusively in the crm
  adminLastNegotiation(contractId: string) {
    const query = [orderBy('_meta.createdAt', 'desc'), limit(1)];
    return this.negotiationService.valueChanges(query, { contractId }).pipe(
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
