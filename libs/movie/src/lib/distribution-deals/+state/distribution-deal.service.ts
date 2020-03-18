import { Injectable } from '@angular/core';
import objectHash from 'object-hash';
import { CollectionService, CollectionConfig } from 'akita-ng-fire';
import { DistributionDealState, DistributionDealStore } from './distribution-deal.store';
import {
  DistributionDeal,
  getDealTerritories,
  createDistributionDealWithMovieId,
  DistributionDealWithMovieId,
  formatDistributionDeal
} from './distribution-deal.model';
import { createContractTitleDetail, ContractWithLastVersion } from '@blockframes/contract/contract/+state/contract.model';
import { ContractVersionService } from '@blockframes/contract/version/+state/contract-version.service';
import { ContractService } from '@blockframes/contract/contract/+state/contract.service';
import { ContractVersion } from '@blockframes/contract/version/+state/contract-version.model';
import { DistributionDealQuery } from './distribution-deal.query';
import { Movie } from '@blockframes/movie/movie/+state';
import { AvailsSearch } from '../form/search.form';
import { Model } from '@blockframes/utils/static-model/staticModels';
import { getFilterMatchingDeals, getDealsInDateRange } from '../create/availabilities.util';


@Injectable({ providedIn: 'root' })
@CollectionConfig({ path: 'movies/:movieId/distributionDeals' })
export class DistributionDealService extends CollectionService<DistributionDealState> {
  constructor(
    private contractService: ContractService,
    private contractVersionService: ContractVersionService,
    private query: DistributionDealQuery,
    store: DistributionDealStore
  ) {
    super(store);
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

    // Cleaning before save
    contract.doc = this.contractService.formatToFirestore(contract.doc);
    contract.last = this.contractVersionService.formatToFirestore(contract.last);

    // If a contract does not have an id, we update contract and link it to this distrubution deal
    // If there is already a contract id, this means it have been created before
    // @TODO (#1887) check this process
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
   */
  public async getContractDistributionDeals(contractId: string): Promise<DistributionDeal[]> {
    const distributionDealsSnap = await this.db
      .collectionGroup('distributionDeals', ref => ref.where('contractId', '==', contractId))
      .get()
      .toPromise();

    return distributionDealsSnap.docs.map(deal => formatDistributionDeal(deal.data() as DistributionDeal));
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

  /** Get the deals linked to the Archipel Contract (of type 'mandate') */
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
