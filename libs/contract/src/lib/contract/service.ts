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
  createDocumentMeta
} from '@blockframes/model';
import { DocumentSnapshot, limit, orderBy, where } from 'firebase/firestore';
import { BlockframesCollection } from '@blockframes/utils/abstract-service';

@Injectable({ providedIn: 'root' })
export class ContractService extends BlockframesCollection<Sale | Mandate> {
  readonly path = 'contracts';

  constructor(
    private orgService: OrganizationService,
    private negotiationService: NegotiationService,
  ) {
    super();
  }

  /**
   * @param contract
   */
  protected fromFirestore(document: DocumentSnapshot<Sale | Mandate>): Sale | Mandate {
    const contract = super.fromFirestore(document);
    return contract.type === 'mandate' ? createMandate(contract) : createSale(contract);
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
    const write = this.negotiationService.batch();
    await this.negotiationService.add({
      _meta: createDocumentMeta({ createdAt: new Date() }),
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

    return write.commit();
  }
}
