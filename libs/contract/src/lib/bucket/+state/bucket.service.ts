import { Injectable } from '@angular/core';
import { centralOrgId } from '@env';
import { switchMap, take } from 'rxjs/operators';
import { AuthService } from '@blockframes/auth/+state/auth.service';
import { createOfferId } from '@blockframes/utils/utils';
import { AvailsFilter } from '@blockframes/contract/avails/avails';
import { OrganizationService } from '@blockframes/organization/+state/organization.service';
import { TermService } from '../../term/+state/term.service';
import { OfferService } from '../../offer/+state/offer.service';
import { ContractService } from '../../contract/+state/contract.service';
import { DocumentSnapshot } from 'firebase/firestore';
import {
  Bucket,
  createBucket,
  createBucketTerm,
  createBucketContract,
  createDocumentMeta,
  MovieCurrency,
  Sale
} from '@blockframes/model';
import { BlockframesCollection } from '@blockframes/utils/abstract-service';

interface AddTermConfig {
  titleId: string,
  parentTermId: string,
  avail: AvailsFilter
};


@Injectable({ providedIn: 'root' })
export class BucketService extends BlockframesCollection<Bucket> {
  readonly path = 'buckets';

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

  protected fromFirestore(document: DocumentSnapshot<Bucket>): Bucket {
    const bucket = super.fromFirestore(document);
    return createBucket(bucket);
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
      const contractId = this.contractService.createId();
      const parentTerms = await this.termService.getValue(contract.parentTermId);
      const parentContract = await this.contractService.getValue(parentTerms.contractId);

      const commonFields = {
        buyerId: orgId,
        buyerUserId: this.authService.uid,
        sellerId: centralOrgId.catalog,
        stakeholders: [...parentContract.stakeholders, orgId],
      };

      // Create the contract
      await this.contractService.add<Sale>({
        _meta: createDocumentMeta(),
        status: 'pending',
        id: contractId,
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
