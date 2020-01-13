import { Injectable } from '@angular/core';
import objectHash from 'object-hash';
import { firestore } from 'firebase';
import { CollectionConfig, CollectionService } from 'akita-ng-fire';
import { DistributionDealState, DistributionDealStore } from './distribution-deal.store';
import { OrganizationQuery } from '@blockframes/organization/+state/organization.query';
import { MovieQuery } from '../../movie/+state/movie.query';
import { DistributionDeal } from './distribution-deal.model';
import { createContractTitleDetail } from '@blockframes/contract/+state/contract.model';
import { ContractVersionService } from '@blockframes/contract/version/+state/contract-version.service';
import { ContractWithLastVersion } from '@blockframes/contract/version/+state/contract-version.model';
import { ContractService } from '@blockframes/contract/+state/contract.service';

@Injectable({ providedIn: 'root' })
@CollectionConfig({ path: 'movies/:movieId/distributiondeals' })
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
    return `movies/${this.movieQuery.getActiveId()}/distributiondeals`;
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
      // Populate distribution deal contract
      contract.last.titles[movieId] = createContractTitleDetail();
      contract.last.titles[movieId].titleId = movieId;
      contract.last.titles[movieId].distributionDealIds.push(distributionDeal.id);
      if (!contract.doc.titleIds.includes(movieId)) {
        contract.doc.titleIds.push(movieId);
      }

      // @todo #1397 change this price calculus
      contract.last.titles[movieId].price = contract.last.price;

      const contractId = await this.contractVersionService.addContractAndVersion(
        contract.doc,
        contract.last
      );

      // Link distributiondeal with contract
      distributionDeal.contractId = contractId;
    } else {
      // Link distributiondeal with contract
      distributionDeal.contractId = contract.doc.id;
      // Contract may have been updated along with the distribution deal, we update it
      await this.contractService.add(contract.doc);
      await this.contractVersionService.add(contract.last);
      return distributionDeal.id ;
    }
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
    const myDeals = await this.getValue(ref =>
      ref.where(`${type}.orgId`, '==', this.organizationQuery.getActiveId())
    );
    return myDeals.map(deal => this.formatDistributionDeal(deal));
  }

  /**
   * Get distributionDeals from a specific movie.
   * @param movieId
   */
  public async getDistributionDeals(movieId?: string) {
    const distributionDealsSnap = await this.db.collection(`movies/${movieId}/distributiondeals`).get().toPromise();
    return distributionDealsSnap.docs.map(deal => deal.data() as DistributionDeal);
  }
}
