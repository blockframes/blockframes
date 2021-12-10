
import { Injectable } from '@angular/core';

import { CollectionConfig, CollectionService } from 'akita-ng-fire';

import { centralOrgId } from '@env';

import { switchMap, take } from 'rxjs/operators';
import { AuthQuery } from '@blockframes/auth/+state';
import { createOfferId } from '@blockframes/utils/utils';
import { MovieCurrency } from '@blockframes/utils/static-model';
import { AvailsFilter } from '@blockframes/contract/avails/avails';
import { createDocumentMeta } from '@blockframes/utils/models-meta';
import { OrganizationQuery } from '@blockframes/organization/+state';

import { TermService } from '../../term/+state';
import { OfferService } from '../../offer/+state';
import { IncomeService } from '../../income/+state';
import { Bucket, createBucket } from './bucket.model';
import { BucketStore, BucketState } from './bucket.store';
import { createBucketTerm, createBucketContract } from './bucket.model';
import { ContractService, convertDuration } from '../../contract/+state';
import { NegotiationService } from '@blockframes/contract/negotiation/+state/negotiation.service';
import {  NegotiationStatus } from '@blockframes/contract/negotiation/+state/negotiation.firestore';

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
    private authQuery: AuthQuery,
    private negotiationService: NegotiationService,
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

  async createOffer(specificity: string, delivery: string, currency: MovieCurrency) {
    const orgId = this.orgQuery.getActiveId();
    const orgName = this.orgQuery.getActive().denomination.full;
    const bucket = await this.getActive();
    await this.update(orgId, {
      specificity,
      delivery,
      uid: this.authQuery.userId  // Specify who is updating the bucket (this is used in the backend)
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
      const terms = contract.terms
        .map(t => ({ ...t, contractId, id: this.db.createId() }));
      const termIds = terms.map(t => t.id);
      const parentTerms = await this.termService.getValue(contract.parentTermId);
      const parentContract = await this.contractService.getValue(parentTerms.contractId);

      const commonFields = {
        status: 'pending' as NegotiationStatus,
        buyerId: orgId,
        buyerUserId: this.authQuery.userId,
        sellerId: centralOrgId.catalog,
        stakeholders: [...parentContract.stakeholders, orgId],
        offerId,
        specificity,
        delivery,
      }
      // Create the contract
      await this.contractService.add({
        _meta: createDocumentMeta({ createdAt: new Date(), }),
        id: contractId,
        type: 'sale',
        titleId: contract.titleId,
        parentTermId: contract.parentTermId,
        termIds,
        holdbacks: contract.holdbacks,
        ...commonFields
      });


      //add the default negotiation.
      await this.contractService.addNegotiation(contractId, {
        ...contract,
        ...commonFields
      })
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


  async addTerm(titleId: string, parentTermId: string, avails: AvailsFilter) {

    const orgId = this.orgQuery.getActiveId();
    const rawBucket = await this.getActive();
    const bucket = createBucket({ id: orgId, ...rawBucket });

    const term = createBucketTerm(avails);

    const sale = bucket.contracts.find(contract => contract.titleId === titleId && contract.parentTermId === parentTermId);

    if (sale) {
      sale.terms.push(term);
    } else {
      const contract = createBucketContract({ titleId, parentTermId, terms: [term] });
      bucket.contracts.push(contract);
    }

    if (rawBucket) {
      this.update(orgId, bucket);
    } else {
      this.add(bucket);
    }
  }
}
