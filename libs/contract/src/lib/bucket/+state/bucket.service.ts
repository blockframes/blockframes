import { Injectable } from '@angular/core';
import { CollectionConfig, CollectionService } from 'akita-ng-fire';
import { BucketStore, BucketState } from './bucket.store';
import { Bucket } from './bucket.model';
import { Term, TermService } from '../../term/+state';
import { Contract, ContractService } from '../../contract/+state';
import { OfferService } from '../../offer/+state';
import { IncomeService } from '../../income/+state';
import { OrganizationQuery } from '@blockframes/organization/+state';
import { centralOrgID } from '@env';
import type firebase from 'firebase';
import { AuthQuery } from "@blockframes/auth/+state";

@Injectable({ providedIn: 'root' })
@CollectionConfig({ path: 'buckets' })
export class BucketService extends CollectionService<BucketState> {

  constructor(
    store: BucketStore,
    private orgQuery: OrganizationQuery,
    private termService: TermService,
    private offerService: OfferService,
    private contractService: ContractService,
    private incomeService: IncomeService,
    private authQuery: AuthQuery
  ) {
    super(store);
  }

  formatFromFirestore(bucket): Bucket {
    for (const contract of bucket.contracts) {
      for (const term of contract.terms) {
        term.duration.from = term.duration.from.toDate();
        term.duration.to = term.duration.to.toDate();        
      }
    }
    return bucket;
  }

  async createOffer(data: { specificity: string, delivery: string }) {
    const orgId = this.orgQuery.getActiveId();

    const get = <T>(tx: firebase.firestore.Transaction, path: string): Promise<T> => {
      const ref = this.db.doc(path).ref;
      return tx.get(ref).then(snap => snap.data() as T);
    }
     // Run tx
    return this.update(orgId, async (bucket: Bucket, tx) => {
      /* -------------------- */
      /*         GETTER       */
      /* -------------------- */

      // Get the parent contract for setting the stakeholders
      // We need to do all the queries before the changes:
      const parentContracts: Record<string, Contract> = {};
      for (const contract of bucket.contracts) {
        const parentTerms = await get<Term>(tx, `terms/${contract.parentTermId}`);
        const parentContract = await get<Contract>(tx, `contracts/${parentTerms.contractId}`);
        parentContracts[contract.parentTermId] = parentContract;
      }
  
      /* -------------------- */
      /*         SETTER       */
      /* -------------------- */
      
      // Create offer
      const offerId = await this.offerService.add({
        buyerId: orgId,
        status: 'pending',
        date: new Date(),
        delivery: data.delivery
      }, { write: tx });
      // For each contract
      for (const contract of bucket.contracts) {
        const contractId = this.db.createId();
        const terms = contract.terms.map(t => ({ ...t, contractId }));
        // Create the terms
        const termIds = await this.termService.add(terms, { write: tx });
        // Create the contract
        await this.contractService.add({
          id: contractId,
          type: 'sale',
          status: 'pending',
          titleId: contract.titleId,
          parentTermId: contract.parentTermId,
          buyerId: orgId,
          sellerId: centralOrgID, // @todo(#5156) Use centralOrgId.catalog instead
          stakeholders: [ ...parentContracts[contract.parentTermId].stakeholders, orgId ],
          termIds,
          offerId,
          specificity: data.specificity
        }, { write: tx });
        // Create the income
        await this.incomeService.add({
          status: 'pending',
          termsId: contract.parentTermId,
          price: contract.price,
          currency: bucket.currency,
          contractId,
        }, { write: tx });
      }

      // Adding uid to add user data to email sent to business team
      return { ...data, uid: this.authQuery.userId }
    });
  }
}
