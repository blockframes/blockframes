import { Injectable } from '@angular/core';
import { CollectionService, CollectionConfig } from 'akita-ng-fire';
import { DistributionDealState, DistributionDealStore } from './distribution-deal.store';
import {
  DistributionDeal,
  getDealTerritories,
  createDistributionDealWithMovieId,
  DistributionDealWithMovieId,
  formatDistributionDeal
} from './distribution-deal.model';
import { ContractVersion } from '@blockframes/contract/version/+state/contract-version.model';
import { DistributionDealQuery } from './distribution-deal.query';
import { Movie } from '@blockframes/movie/+state';
import { AvailsSearch } from '../form/search.form';
import { Model } from '@blockframes/utils/static-model/staticModels';
import { getFilterMatchingDeals, getDealsInDateRange } from '../create/availabilities.util';

@Injectable({ providedIn: 'root' })
@CollectionConfig({ path: 'movies/:movieId/distributionDeals' })
export class DistributionDealService extends CollectionService<DistributionDealState> {
  constructor(
    private query: DistributionDealQuery,
    store: DistributionDealStore
  ) {
    super(store);
  }

  /**
   * Get distributionDeals from a specific movie.
   * @param movieId
   */
  public async getMovieDistributionDeals(movieId: string): Promise<DistributionDeal[]> {
    const distributionDeals = await this.getValue({ params: { movieId } });
    return distributionDeals.map(deal => formatDistributionDeal(deal));
  }

  /**
   * Get distributionDeals from a specific contract.
   * @param contractId
   * @param movieId
   */
  public async getContractDistributionDeals(contractId: string, movieId: string): Promise<DistributionDeal[]> {
    const distributionDeals = await this.getValue(ref => ref.where('contractId', '==', contractId), { params: { movieId } });
    return distributionDeals.map(deal => formatDistributionDeal(deal));
  }

  /**
   * @dev ADMIN method
   * Get all distributionDeals.
   * This method need an index @see firestore.indexes.json
   */
  public async getAllDistributionDealsWithMovieId(): Promise<DistributionDealWithMovieId[]> {
    const distributionDealsSnap = await this.db
      .collectionGroup('distributionDeals')
      .get()
      .toPromise();
    const distributionDeals = distributionDealsSnap.docs.map(deal => createDistributionDealWithMovieId({
      movieId: deal.ref.parent.parent.id,
      deal: formatDistributionDeal(deal.data()),
    }));
    return distributionDeals;
  }

  /**
   * Returns all eligible territories from contract's deals.
   * @param contractVersion
   */
  public getTerritoriesFromContract(contractVersion: ContractVersion): string[] {
    // Get all the deals from the contract titles.
    const deals = Object.values(contractVersion.titles).map(({ distributionDealIds }) =>
      this.query.getEntity(distributionDealIds)
    );
    // Returns all deals eligible territories as an array of string.
    return deals.map(deal => deal ? getDealTerritories(deal) : []).flat();
  }

  /**
   * Gets the deals linked to the Archipel Contract (of type 'mandate')
   * @param movie 
   */
  public async getMandateDeals(movie: Movie): Promise<DistributionDeal[]> {
    const contractsSnap = await this.db.collection(
      `publicContracts/`, ref => ref.where('type', '==', 'mandate').where('titleIds', 'array-contains', movie.id))
      .get().toPromise();
    const contracts = contractsSnap.docs.map(contract => contract.data());
    return movie.distributionDeals.filter(deal => deal.contractId === contracts[0].id);
  }

  /** Check if the formValue is valid to create a deal, throw an error for each case. */
  public verifyDeal(formValue: AvailsSearch, territories: Model['TERRITORIES']) {
    if (!formValue.terms.start || !formValue.terms.end) {
      throw new Error('Fill terms "Start Date" and "End Date" in order to create an Exploitation Right');
    }
    if (!formValue.territory.length) {
      throw new Error('Select at least one available territory to create an Exploitation Right');
    }
    if (!formValue.licenseType.length) {
      throw new Error('Select at least one available territory to create an Exploitation Right');
    }
    if (formValue.territory.some(territory => !territories.find(({ slug }) => slug === territory))) {
      throw new Error('One or more selected territories are not available');
    }
    return true;
  }

  public dealExist(formValue: AvailsSearch, titleDeals: DistributionDeal[]): boolean {
    const dealsInDateRange = getDealsInDateRange(formValue.terms, titleDeals);
    const matchingDeals = getFilterMatchingDeals(formValue, dealsInDateRange);
    return matchingDeals.length ? true : false;
  }
}
