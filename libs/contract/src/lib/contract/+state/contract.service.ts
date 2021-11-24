import { Injectable } from '@angular/core';
import { ContractStore, ContractState } from './contract.store';
import { CollectionConfig, CollectionService, PathParams } from 'akita-ng-fire';
import { ContractDocument, convertDuration, createMandate, createSale, Holdback, Mandate, Sale } from './contract.model';
import { formatDocumentMetaFromFirestore } from "@blockframes/utils/models-meta";
import { Timestamp } from "@blockframes/utils/common-interfaces/timestamp";
import { NegotiationService } from '@blockframes/contract/negotiation/+state/negociation.service';
import { map } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
@CollectionConfig({ path: 'contracts' })
export class ContractService extends CollectionService<ContractState> {
  useMemorization = true;

  constructor(
    store: ContractStore,
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

  /** Return the last negociation of the contractId */
  lastNegociation(contractId: string) {
    const options = { contractId } as PathParams;
    return this.negotiationService.valueChanges(ref => ref.orderBy('_meta.createdAt', 'desc').limit(1), options).pipe(
      map(negociations => negociations[0])
    );
  }
}
