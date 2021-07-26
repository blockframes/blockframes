import { Injectable } from '@angular/core';
import { CollectionConfig, CollectionService } from 'akita-ng-fire';
import { BucketStore, BucketState } from './bucket.store';
import { Bucket, createBucket } from './bucket.model';
import { TermService } from '../../term/+state';
import { ContractService, convertDuration } from '../../contract/+state';
import { OfferService } from '../../offer/+state';
import { IncomeService } from '../../income/+state';
import { OrganizationQuery } from '@blockframes/organization/+state';
import { centralOrgId } from '@env';
import { AuthQuery } from "@blockframes/auth/+state";
import { switchMap, take } from 'rxjs/operators';
import { createOfferId } from '@blockframes/utils/utils';
import { createDocumentMeta } from '@blockframes/utils/models-meta';
import { MovieCurrency } from '@blockframes/utils/static-model';

@Injectable({ providedIn: 'root' })
@CollectionConfig({ path: 'buckets' })
export class BucketService extends CollectionService<BucketState> {
  useMemorization = true;
  active$ = this.orgQuery.selectActiveId().pipe(
    switchMap(orgId => this.valueChanges(orgId)),
  );

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

  formatFromFirestore(document): Bucket {
    if (!document) return;
    const bucket = createBucket(document);
    for (const contract of bucket.contracts) {
      for (const term of contract.terms) {
        term.duration = convertDuration(term.duration);
      }
      for (const holdback of contract.holdbacks) {
        holdback.duration = convertDuration(holdback.duration);
      }
    }
    return bucket;
  }

  getActive() {
    return this.active$.pipe(take(1)).toPromise();
  }

  async createOffer(specificity: string, delivery: string, currency:MovieCurrency) {
    const orgId = this.orgQuery.getActiveId();
    const orgName = this.orgQuery.getActive().denomination.full;
    const bucket = await this.getActive();
    await this.update(orgId, {
      specificity,
      delivery,
      currency,
      uid: this.authQuery.userId  // Specify who is updating the
    });

    // Create offer
    const offerId = createOfferId(orgName);
    await this.offerService.add({
      buyerId: orgId,
      buyerUserId: this.authQuery.userId,
      specificity,
      status: 'pending',
      currency,
      _meta: createDocumentMeta({ createdAt: new Date() }),
      delivery,
      id: offerId,
    });

    const promises = bucket.contracts.map(async (contract) => {
      const contractId = this.db.createId();
      const terms = contract.terms.map(t => ({ ...t, contractId, id: this.db.createId() }));
      const termIds = terms.map(t => t.id);
      const parentTerms = await this.termService.getValue(contract.parentTermId);
      const parentContract = await this.contractService.getValue(parentTerms.contractId);
      // Create the contract
      await this.contractService.add({
        _meta: createDocumentMeta({ createdAt: new Date(), }),
        id: contractId,
        type: 'sale',
        status: 'pending',
        titleId: contract.titleId,
        parentTermId: contract.parentTermId,
        buyerId: orgId,
        buyerUserId: this.authQuery.userId,
        sellerId: centralOrgId.catalog,
        stakeholders: [...parentContract.stakeholders, orgId],
        termIds,
        offerId,
        specificity,
      });

      // @dev: Create income & terms after contract because rules require contract to be created first
      // Create the terms
      await this.termService.add(terms);
      // Create the income
      await this.incomeService.add({
        id: contractId,
        status: 'pending',
        termsId: contract.parentTermId,
        price: contract.price,
        currency: bucket.currency,
        offerId
      });

    });
    return Promise.all(promises);
  }
}
