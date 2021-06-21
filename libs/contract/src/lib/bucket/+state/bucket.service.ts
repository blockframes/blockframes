import { Injectable } from '@angular/core';
import { CollectionConfig, CollectionService } from 'akita-ng-fire';
import { BucketStore, BucketState } from './bucket.store';
import { Bucket } from './bucket.model';
import { TermService } from '../../term/+state';
import { ContractService } from '../../contract/+state';
import { OfferService } from '../../offer/+state';
import { IncomeService } from '../../income/+state';
import { OrganizationQuery } from '@blockframes/organization/+state';
import { centralOrgId } from '@env';
import { AuthQuery } from "@blockframes/auth/+state";
import { shareReplay, switchMap, take } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
@CollectionConfig({ path: 'buckets' })
export class BucketService extends CollectionService<BucketState> {
  active$ = this.orgQuery.selectActiveId().pipe(
    switchMap((orgId) => this.valueChanges(orgId)),
    shareReplay(1)
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

  formatFromFirestore(bucket): Bucket {
    if (!bucket) return;
    for (const contract of bucket.contracts) {
      for (const term of contract.terms) {
        term.duration.from = term.duration.from.toDate();
        term.duration.to = term.duration.to.toDate();
      }
    }
    return bucket;
  }

  getActive() {
    return this.active$.pipe(take(1)).toPromise();
  }

  async createOffer(specificity: string, delivery: string) {
    const orgId = this.orgQuery.getActiveId();
    const bucket = await this.getActive();

    await this.update(orgId, {
      specificity,
      delivery,
      uid: this.authQuery.userId  // Specify who is updating the
    });

    // Create offer
    const offerId = await this.offerService.add({
      buyerId: orgId,
      buyerUserId: this.authQuery.userId,
      specificity,
      status: 'pending',
      date: new Date(),
      delivery
    });

    const promises = bucket.contracts.map(async (contract) => {
      const contractId = this.db.createId();
      const terms = contract.terms.map(t => ({ ...t, contractId, id: this.db.createId() }));
      const termIds = terms.map(t => t.id);
      const parentTerms = await this.termService.getValue(contract.parentTermId);
      const parentContract = await this.contractService.getValue(parentTerms.contractId);
      // Create the contract
      await this.contractService.add({
        id: contractId,
        type: 'sale',
        status: 'pending',
        titleId: contract.titleId,
        parentTermId: contract.parentTermId,
        buyerId: orgId,
        buyerUserId: this.authQuery.userId,
        sellerId: centralOrgId.catalog,
        stakeholders: [ ...parentContract.stakeholders, orgId ],
        termIds,
        offerId,
        specificity,
      });

      // @dev: Create income & terms after contract because rules require contract to be created first
      // Create the terms
      await this.termService.add(terms);
      // Create the income
      await this.incomeService.add({
        status: 'pending',
        termsId: contract.parentTermId,
        price: contract.price,
        currency: bucket.currency,
        contractId,
      });

    });
    return Promise.all(promises);
  }
}
