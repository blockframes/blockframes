import { Injectable } from '@angular/core';
import { CollectionConfig, CollectionService } from 'akita-ng-fire';
import { centralOrgId } from '@env';
import { switchMap, take } from 'rxjs/operators';
import { AuthService } from '@blockframes/auth/+state';
import { createOfferId } from '@blockframes/model';
import { AvailsFilter } from '@blockframes/contract/avails/avails';
import { OrganizationService } from '@blockframes/organization/+state';
import { TermService } from '../../term/+state';
import { OfferService } from '../../offer/+state';
import { ContractService } from '../../contract/+state';
import { ActiveState, EntityState } from '@datorama/akita';
import { collection, doc } from 'firebase/firestore';
import {
  convertDuration,
  Bucket,
  createBucket,
  createBucketTerm,
  createBucketContract,
  createDocumentMeta,
  MovieCurrency
} from '@blockframes/model';

interface BucketState extends EntityState<Bucket>, ActiveState<string> { }
interface AddTermConfig {
  titleId: string,
  parentTermId: string,
  avail: AvailsFilter
};


@Injectable({ providedIn: 'root' })
@CollectionConfig({ path: 'buckets' })
export class BucketService extends CollectionService<BucketState> {
  useMemorization = false;
  active$ = this.orgService.currentOrg$.pipe(
    switchMap(org => this.valueChanges(org.id)),
  );

  constructor(
    private orgService: OrganizationService,
    private termService: TermService,
    private offerService: OfferService,
    private contractService: ContractService,
    private authService: AuthService,
  ) {
    super();
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
    const orgId = this.orgService.org.id;
    const orgName = this.orgService.org.denomination.full;
    const bucket = await this.getActive();
    await this.update(orgId, {
      specificity,
      delivery,
      uid: this.authService.uid  // Specify who is updating the bucket (this is used in the backend)
    });

    // Create offer
    const offerId = createOfferId(orgName);
    await this.offerService.add({
      buyerId: orgId,
      buyerUserId: this.authService.uid,
      specificity,
      status: 'pending',
      currency,
      _meta: createDocumentMeta({ createdAt: new Date() }),
      delivery,
      id: offerId,
    });

    const promises = bucket.contracts.map(async (contract) => {
      const contractId = doc(collection(this.db, '_')).id;
      const parentTerms = await this.termService.getValue(contract.parentTermId);
      const parentContract = await this.contractService.getValue(parentTerms.contractId);

      const commonFields = {
        buyerId: orgId,
        buyerUserId: this.authService.uid,
        sellerId: centralOrgId.catalog,
        stakeholders: [...parentContract.stakeholders, orgId],
      };

      // Create the contract
      await this.contractService.add({
        _meta: createDocumentMeta(),
        status: 'pending',
        id: contractId,
        type: 'sale',
        titleId: contract.titleId,
        parentTermId: contract.parentTermId,
        holdbacks: contract.holdbacks,
        offerId,
        specificity,
        delivery,
        ...commonFields
      });

      // Add the default negotiation.
      this.contractService.addNegotiation(contractId, {
        ...contract,
        ...commonFields,
        initial: new Date(),
        currency,
      }).catch(err => console.error(err));
    });
    return Promise.all(promises);
  }

  async addBatchTerms(availsResults: AddTermConfig[]) {
    const orgId = this.orgService.org.id;
    let bucket = await this.getActive();
    if (!bucket) bucket = createBucket({ id: orgId });

    for (const { titleId, parentTermId, avail } of availsResults) {
      const term = createBucketTerm(avail);
      const sale = bucket.contracts.find(c => c.titleId === titleId && c.parentTermId === parentTermId);
      if (sale) {
        sale.terms.push(term);
      } else {
        const contract = createBucketContract({ titleId, parentTermId, terms: [term] });
        bucket.contracts.push(contract);
      }
    }

    return this.upsert(bucket);
  }
}
