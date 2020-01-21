import { Injectable } from '@angular/core';
import objectHash from 'object-hash';
import { firestore } from 'firebase';
import { CollectionService } from 'akita-ng-fire';
import { DistributionDealState, DistributionDealStore } from './distribution-deal.store';
import { OrganizationQuery } from '@blockframes/organization/+state/organization.query';
import { MovieQuery } from '../../movie/+state/movie.query';
import { DistributionDeal } from './distribution-deal.model';
import { createContractTitleDetail, ContractWithLastVersion } from '@blockframes/contract/contract/+state/contract.model';
import { ContractVersionService } from '@blockframes/contract/version/+state/contract-version.service';
import { ContractService } from '@blockframes/contract/contract/+state/contract.service';

@Injectable({ providedIn: 'root' })
export class DistributionDealService extends CollectionService<DistributionDealState> {
  constructor(
    private movieQuery: MovieQuery,
    private organizationQuery: OrganizationQuery,
    private contractService: ContractService,
    private contractVersionService: ContractVersionService,
    store: DistributionDealStore
  ) {
    super(store);
  }

  get path() {
    return `movies/${this.movieQuery.getActiveId()}/distributionDeals`;
  }

  /**
   *
   * @param movieId
   * @param distributionDeal
   */
  public async addDistributionDeal(movieId: string, distributionDeal: DistributionDeal, contract: ContractWithLastVersion) {
    // Create an id from DistributionDeal content.
    // A same DistributionDeal document will always have the same hash to prevent multiple insertion of same deal
    if (!distributionDeal.id) {
      distributionDeal.id = objectHash(distributionDeal);
    }

    // If a contract does not have an id, we update contract and link it to this distrubution deal
    // If there is already a contract id, this means it have been created before
    if (!contract.doc.id) {
      contract.doc.id = this.db.createId();
      // Populate distribution deal contract
      contract.last.titles[movieId] = createContractTitleDetail();
      contract.last.titles[movieId].titleId = movieId;
      contract.last.titles[movieId].distributionDealIds.push(distributionDeal.id);
      if (!contract.doc.titleIds.includes(movieId)) {
        contract.doc.titleIds.push(movieId);
      }

      // @todo #1397 change this price calculus
      contract.last.titles[movieId].price = contract.last.price;

      const contractId = await this.contractService.addContractAndVersion(contract);

      // Link distributiondeal with contract
      distributionDeal.contractId = contractId;
    } else {
      // Link distributiondeal with contract
      distributionDeal.contractId = contract.doc.id;
      // Contract may have been updated along with the distribution deal, we update it
      await this.contractService.add(contract.doc);
      await this.contractVersionService.add(contract.last);
      return distributionDeal.id;
    }


    /// @todo #1562 add ditribution deal
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
  public async getMyDeals(type: string = 'licensor'): Promise<DistributionDeal[]> {
    const myDealsSnap = await this.db
      .collectionGroup('distributionDeals', ref => ref.where(`${type}.orgId`, '==', this.organizationQuery.getActiveId()))
      .get()
      .toPromise();
    const myDeals = myDealsSnap.docs.map(deal => this.formatDistributionDeal(deal.data()));
    return myDeals;
  }

  /**
   * Get distributionDeals from a specific movie.
   * @param movieId
   */
  public async getMovieDistributionDeals(movieId: string): Promise<DistributionDeal[]> {
    const distributionDealsSnap = await this.db
      .collection(`movies/${movieId}/distributionDeals`)
      .get()
      .toPromise();
    const distributionDeals = distributionDealsSnap.docs.map(deal => this.formatDistributionDeal(deal.data()));
    return distributionDeals;
  }

  /**
   * Get distributionDeals from a specific contract.
   * @param contractId
   */
  public async getContractDistributionDeals(contractId: string): Promise<DistributionDeal[]> {
    const distributionDealsSnap = await this.db
      .collectionGroup('distributionDeals', ref => ref.where('contractId', '==', contractId))
      .get()
      .toPromise();
    const distributionDeals = distributionDealsSnap.docs.map(deal => this.formatDistributionDeal(deal.data()));
    return distributionDeals;
  }

  /**
   * Get all the territories from a list of deals and
   * return them into an array of string
   * @param deals
   */
  public getDistributionDealsTerritories(deals: DistributionDeal[]): string[] {
    const territories = deals.map(deal => deal.territory.map(territory => territory));
    const flattenedTerritories = territories.reduce((acc, nestedArray) => acc.concat(nestedArray));
    return flattenedTerritories;
  }
}
