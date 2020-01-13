import { Injectable } from '@angular/core';
import objectHash from 'object-hash';
import { firestore } from 'firebase';
import { CollectionConfig, CollectionService } from 'akita-ng-fire';
import { AngularFirestoreCollection, AngularFirestoreDocument } from '@angular/fire/firestore';
import { DistributionDealState, DistributionDealStore } from './distribution-deal.store';
import { OrganizationQuery } from '@blockframes/organization/+state/organization.query';
import { ContractService } from '@blockframes/contract/+state/contract.service';
import { MovieQuery } from '../../movie/+state/movie.query';
import { DistributionDeal } from './distribution-deal.model';
import { createContractTitleDetail } from '@blockframes/contract/+state/contract.model';
import { Movie } from '@blockframes/movie/movie+state/movie.model';
import { ContractVersionService } from '@blockframes/contract/version/+state/contract-version.service';
import { ContractWithLastVersion } from '@blockframes/contract/version/+state/contract-version.model';

@Injectable({ providedIn: 'root' })
@CollectionConfig({ path: 'movies/:movieId/distributiondeals' })
export class DistributionDealService extends CollectionService<DistributionDealState> {
  constructor(
    private movieQuery: MovieQuery,
    private organizationQuery: OrganizationQuery,
    private contractVersionService: ContractVersionService,
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
    return this.movieDoc(movieId).collection('distributiondeals');
  }

  /**
   *
   * @param movieId
   */
  private movieDoc(movieId: string): AngularFirestoreDocument<Movie> {
    return this.db.doc(`movies/${movieId}`);
  }

  /**
   *
   * @param movieId
   * @param distributionDeal
   */
  public async addDistributionDeal(movieId: string, distributionDeal: DistributionDeal, contract: ContractWithLastVersion): Promise<string> { // @TODO (#1440) replace contract: any with contract: Contract
    // Create an id from DistributionDeal content.
    // A same DistributionDeal document will always have the same hash to prevent multiple insertion of same deal
    // @TODO #1389 Use native akita-ng-fire functions : https://netbasal.gitbook.io/akita/angular/firebase-integration/collection-service
    if (!distributionDeal.id) {
      distributionDeal.id = objectHash(distributionDeal);
    }

    // If a contract does not have an id, we update contract and link it to this distrubution deal
    // If there is already a contract id, this means it have been created before
    if (!contract.doc.id) {
      // Populate distribution deal contract
      contract.last.titles[movieId] = createContractTitleDetail();
      contract.last.titles[movieId].titleId = movieId;
      contract.last.titles[movieId].distributionDealIds.push(distributionDeal.id);
      if (!contract.doc.titleIds.includes(movieId)) {
        contract.doc.titleIds.push(movieId);
      }

      // @todo #1397 change this price calculus
      contract.last.titles[movieId].price = contract.last.price;

      const contractId = await this.contractVersionService.addContractAndVersion(contract.doc, contract.last);

      // Link distributiondeal with contract
      distributionDeal.contractId = contractId;
    } else {
      // Link distributiondeal with contract
      distributionDeal.contractId = contract.doc.id;
      // Contract may have been updated along with the distribution deal, we update it
      await this.db.collection('contracts').doc(contract.doc.id).set(contract.doc);
      await this.contractVersionService.add(contract.last);
    }

    // @TODO #1389 Use native akita-ng-fire functions : https://netbasal.gitbook.io/akita/angular/firebase-integration/collection-service
    await this.getCollection(movieId).doc(distributionDeal.id).set(distributionDeal);
    return distributionDeal.id;
  }

  /**
   * Checks if a distribution deal is already existing for a given movie and returns it.
   * @param movieId
   * @param distributionDeal
   */
  public async existingDistributionDeal(movieId: string, distributionDeal: DistributionDeal): Promise<DistributionDeal> {
    const dealId = distributionDeal.id ? distributionDeal.id : objectHash(distributionDeal);
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
