import { Injectable } from '@angular/core';
import objectHash from 'object-hash';
import { CollectionService, CollectionConfig } from 'akita-ng-fire';
import { DistributionDealState, DistributionDealStore } from './distribution-deal.store';
import { OrganizationQuery } from '@blockframes/organization/+state/organization.query';
import { DistributionDeal, getDealTerritories, formatDistributionDeal } from './distribution-deal.model';
import { createContractTitleDetail, ContractWithLastVersion } from '@blockframes/contract/contract/+state/contract.model';
import { ContractVersionService } from '@blockframes/contract/version/+state/contract-version.service';
import { ContractService } from '@blockframes/contract/contract/+state/contract.service';
import { toDate } from '@blockframes/utils/helpers';
import { ContractQuery } from '@blockframes/contract/contract/+state/contract.query';
import { switchMap } from 'rxjs/operators';
import { combineLatest } from 'rxjs';
import { ContractVersion } from '@blockframes/contract/version/+state/contract-version.model';
import { DistributionDealQuery } from './distribution-deal.query';

@Injectable({ providedIn: 'root' })
@CollectionConfig({ path: 'movies/:movieId/distributionDeals' })
export class DistributionDealService extends CollectionService<DistributionDealState> {
  constructor(
    private organizationQuery: OrganizationQuery,
    private contractService: ContractService,
    private contractVersionService: ContractVersionService,
    private contractQuery: ContractQuery,
    private dealQuery: DistributionDealQuery,
    store: DistributionDealStore
  ) {
    super(store);
  }

  /** Gets every distribution deals of contracts in the store. */
  public syncContractsDeals() {
    return this.contractQuery.selectAll().pipe(
      switchMap(contracts => {
        const $ = contracts.map(c =>
          this.syncCollectionGroup('distributionDeals', ref => ref.where('contractId', '==', c.id))
        );
        return combineLatest($);
      })
    );
  }

  /**
   *
   * @param movieId
   * @param distributionDeal
   */
  public async addDistributionDeal(movieId: string, distributionDeal: DistributionDeal, contract: ContractWithLastVersion): Promise<string> {
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

      // @todo #1657 change this price calculus
      contract.last.titles[movieId].price = contract.last.price;

      const contractId = await this.contractService.addContractAndVersion(contract);

      // Link distributiondeal with contract
      distributionDeal.contractId = contractId;
    } else {
      // Link distributiondeal with contract
      distributionDeal.contractId = contract.doc.id;
      // Contract may have been updated along with the distribution deal, we update it
      await this.contractService.add(contract.doc);
      await this.contractVersionService.add(contract.last, { params: { contractId: contract.doc.id } });
    }
    await this.add(distributionDeal, { params: { movieId } });

    return distributionDeal.id;
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
    const myDeals = myDealsSnap.docs.map(deal => formatDistributionDeal(deal.data()));
    return myDeals;
  }

  /**
   * Get distributionDeals from a specific movie.
   * @param movieId
   */
  public async getMovieDistributionDeals(movieId: string): Promise<DistributionDeal[]> {
    const distributionDeals = await this.getValue({ params: { movieId } });
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
    const distributionDeals = distributionDealsSnap.docs.map(deal => formatDistributionDeal(deal.data()));
    return distributionDeals;
  }

  /**
   * Returns all eligible territories from contract's deals.
   * @param contractVersion
   */
  public getTerritoriesFromContract(contractVersion: ContractVersion): string[] {
    // Get all the deals from the contract titles.
    const deals = Object.values(contractVersion.titles).map(({ distributionDealIds }) =>
      this.dealQuery.getEntity(distributionDealIds)
    );
    // Returns all deals eligible territories as an array of string.
    return deals.map(deal => deal ? getDealTerritories(deal) : []).flat();
  }
}
