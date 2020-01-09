import { Injectable } from '@angular/core';
import { DistributionDealState, DistributionDealStore } from './distribution-deal.store';
import { OrganizationQuery } from '@blockframes/organization/+state/organization.query';
import { ContractService } from '@blockframes/contract/+state/contract.service';
import { MovieQuery } from '../../movie/+state/movie.query';
import { CollectionConfig, CollectionService } from 'akita-ng-fire';
import { AngularFirestoreCollection } from '@angular/fire/firestore';
import { DistributionDeal } from './distribution-deal.model';
import { createContractTitleDetail } from '@blockframes/contract/+state/contract.model';
import objectHash from 'object-hash';
import { firestore } from 'firebase';

@Injectable({ providedIn: 'root' })
@CollectionConfig({ path: 'movies/:movieId/distributiondeals' })
export class DistributionDealService extends CollectionService<DistributionDealState> {
  constructor(
    private movieQuery: MovieQuery,
    private organizationQuery: OrganizationQuery,
    private contractService: ContractService,
    store: DistributionDealStore
    )
  {
    super(store);
  }

  get path() {
    return `movies/${this.movieQuery.getActiveId()}/distributiondeals`;
  }

  /**
   *
   * @param movieId
   */
  private getCollection(movieId: string): AngularFirestoreCollection<DistributionDeal> {
    return this.db.doc(movieId).collection('distributiondeals');
  }

  /**
   *
   * @param movieId
   * @param distributionDeal
   */
  public async addDistributionDeal(movieId: string, distributionDeal: DistributionDeal, contract: any): Promise<string> { // @TODO (#1440) replace contract: any with contract: Contract
    // Create an id from DistributionDeal content.
    // A same DistributionDeal document will always have the same hash to prevent multiple insertion of same deal
    // @TODO #1389 Use native akita-ng-fire functions : https://netbasal.gitbook.io/akita/angular/firebase-integration/collection-service
    const dealId = objectHash(distributionDeal);
    distributionDeal.id = dealId;

    // Populate distribution deal contract
    contract.titles[movieId] = createContractTitleDetail();
    contract.titles[movieId].titleId = movieId;
    contract.titles[movieId].distributionDealIds.push(dealId);
    // @todo #1397 change this price calculus
    contract.titles[movieId].price = contract.price;

    const contractId = await this.contractService.add(contract) as string;

    // Link distributiondeal with contract
    distributionDeal.contractId = contractId;

    // @TODO #1389 Use native akita-ng-fire functions : https://netbasal.gitbook.io/akita/angular/firebase-integration/collection-service
    await this.getCollection(movieId).doc(dealId).set(distributionDeal);
    return dealId;
  }

  /**
   * Checks if a distribution deal is already existing for a given movie and returns it.
   * @param movieId
   * @param distributionDeal
   */
  public async existingDistributionDeal(movieId: string, distributionDeal: DistributionDeal): Promise<DistributionDeal> {
    const dealId = objectHash(distributionDeal);
    const distributionDealSnapshot = await this.getCollection(movieId).doc(dealId).get().toPromise();
    return distributionDealSnapshot.exists ? distributionDealSnapshot.data() as DistributionDeal : undefined;
  }

  /**
   * @param movieId
   */
  public async getDistributionDeals(movieId: string): Promise<DistributionDeal[]> {
    const deals = await this.getCollection(movieId).get().toPromise();
    return deals.docs.map(doc => this.formatDistributionDeal(doc.data()));
  }

  public formatDistributionDeal(deal: any): DistributionDeal {
    // Dates from firebase are Timestamps, we convert it to Dates.
    if (deal.terms.start instanceof firestore.Timestamp) {
      deal.terms.start = deal.terms.start.toDate();
    }

    if (deal.terms.end instanceof firestore.Timestamp) {
      deal.terms.end = deal.terms.end.toDate();
    }
    return deal as DistributionDeal;
  }


  /**
   * Performs a collection group query accross movies to retreive sales
   * @param type  licensee | licensor
   */
  // @TODO #1389 Use native akita-ng-fire functions : https://netbasal.gitbook.io/akita/angular/firebase-integration/collection-service
  public async getMyDeals(type: string = 'licensor'): Promise<DistributionDeal[]> {
    const query = this.db.collectionGroup('distributiondeals', ref => ref.where(`${type}.orgId`, '==', this.organizationQuery.getActiveId()))
    const myDeals = await query.get().toPromise();
    return myDeals.docs.map(doc => this.formatDistributionDeal(doc.data()));
  }

}
