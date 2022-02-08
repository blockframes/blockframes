
import { Injectable } from '@angular/core';
import { CollectionConfig, CollectionService } from 'akita-ng-fire';
import { centralOrgId } from '@env';
import { switchMap, take } from 'rxjs/operators';
import { AuthService } from '@blockframes/auth/+state';
import { createOfferId } from '@blockframes/utils/utils';
import { MovieCurrency } from '@blockframes/utils/static-model';
import { AvailsFilter } from '@blockframes/contract/avails/avails';
import { createDocumentMeta } from '@blockframes/utils/models-meta';
import { OrganizationService } from '@blockframes/organization/+state';
import { TermService } from '../../term/+state';
import { OfferService } from '../../offer/+state';
import { Bucket, createBucket } from './bucket.model';
import { createBucketTerm, createBucketContract } from './bucket.model';
import { ContractService, convertDuration } from '../../contract/+state';
import { ActiveState, EntityState } from '@datorama/akita';

interface BucketState extends EntityState<Bucket>, ActiveState<string> { }

@Injectable({ providedIn: 'root' })
@CollectionConfig({ path: 'buckets' })
export class BucketService extends CollectionService<BucketState> {
  useMemorization = true;
  active$ = this.orgService.org$.pipe(
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
      uid: this.authService.profile.uid  // Specify who is updating the bucket (this is used in the backend)
    });

    // Create offer
    const offerId = createOfferId(orgName);
    await this.offerService.add({
      buyerId: orgId,
      buyerUserId: this.authService.profile.uid,
      specificity,
      status: 'pending',
      currency,
      _meta: createDocumentMeta({ createdAt: new Date() }),
      delivery,
      id: offerId,
    });

    const promises = bucket.contracts.map(async (contract) => {
      const contractId = this.db.createId();
      const parentTerms = await this.termService.getValue(contract.parentTermId);
      const parentContract = await this.contractService.getValue(parentTerms.contractId);

      const commonFields = {
        buyerId: orgId,
        buyerUserId: this.authService.profile.uid, // @TODO #7286 or this.authService.uid ?
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


  async addTerm(titleId: string, parentTermId: string, avails: AvailsFilter) {

    const orgId = this.orgService.org.id; // @TODO #7286 replace all occurences by authService.profile.orgId ?
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
