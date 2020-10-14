import { Injectable } from '@angular/core';
import { CollectionService, CollectionConfig } from 'akita-ng-fire';
import { DistributionRightState, DistributionRightStore } from './distribution-right.store';
import {
  DistributionRight,
  getRightTerritories,
  createDistributionRightWithMovieId,
  DistributionRightWithMovieId,
  formatDistributionRight
} from './distribution-right.model';
import { ContractVersion } from '@blockframes/contract/version/+state/contract-version.model';
import { DistributionRightQuery } from './distribution-right.query';
import { Movie } from '@blockframes/movie/+state';
import { AvailsSearch } from '../form/search.form';
import { Model } from '@blockframes/utils/static-model/staticModels';
import { getFilterMatchingRights, getRightsInDateRange } from '../create/availabilities.util';
import { Territories } from '@blockframes/utils/static-model';

@Injectable({ providedIn: 'root' })
@CollectionConfig({ path: 'movies/:movieId/distributionRights' })
export class DistributionRightService extends CollectionService<DistributionRightState> {
  constructor(
    private query: DistributionRightQuery,
    store: DistributionRightStore
  ) {
    super(store);
  }

  /**
   * Get distributionRights from a specific movie.
   * @param movieId
   */
  public async getMovieDistributionRights(movieId: string): Promise<DistributionRight[]> {
    const distributionRights = await this.getValue({ params: { movieId } });
    return distributionRights.map(right => formatDistributionRight(right));
  }

  /**
   * Get distributionRights from a specific contract.
   * @param contractId
   * @param movieId
   */
  public async getContractDistributionRights(contractId: string, movieId: string): Promise<DistributionRight[]> {
    const distributionRights = await this.getValue(ref => ref.where('contractId', '==', contractId), { params: { movieId } });
    return distributionRights.map(right => formatDistributionRight(right));
  }

  /**
   * @dev ADMIN method
   * Get all distributionRights.
   * This method need an index @see firestore.indexes.json
   */
  public async getAllDistributionRightsWithMovieId(): Promise<DistributionRightWithMovieId[]> {
    const distributionRightsSnap = await this.db
      .collectionGroup('distributionRights')
      .get()
      .toPromise();
    const distributionRights = distributionRightsSnap.docs.map(right => createDistributionRightWithMovieId({
      movieId: right.ref.parent.parent.id,
      right: formatDistributionRight(right.data()),
    }));
    return distributionRights;
  }

  /**
   * Returns all eligible territories from contract's right.
   * @param contractVersion
   */
  public getTerritoriesFromContract(contractVersion: ContractVersion): string[] {
    // Get all the rights from the contract titles.
    const rights = Object.values(contractVersion.titles).map(({ distributionRightIds }) =>
      this.query.getEntity(distributionRightIds)
    );
    // Returns all rights eligible territories as an array of string.
    return rights.map(right => right ? getRightTerritories(right) : []).flat();
  }

  /**
   * Gets the rights linked to the Archipel Contract (of type 'mandate')
   * @param movie
   */
  public async getMandateRights(movie: Movie): Promise<DistributionRight[]> {
    const contractsSnap = await this.db.collection(
      `publicContracts/`, ref => ref.where('type', '==', 'mandate').where('titleIds', 'array-contains', movie.id))
      .get().toPromise();
    const contracts = contractsSnap.docs.map(contract => contract.data());
    return movie.distributionRights.filter(right => right.contractId === contracts[0].id);
  }

  /** Check if the formValue is valid to create a right, throw an error for each case. */
  public verifyRight(formValue: AvailsSearch, territories: Territories[]) {
    if (!formValue.terms.start || !formValue.terms.end) {
      throw new Error('Fill terms "Start Date" and "End Date" in order to create an Exploitation Right');
    }
    if (!formValue.territory.length) {
      throw new Error('Select at least one available territory to create an Exploitation Right');
    }
    if (!formValue.licenseType.length) {
      throw new Error('Select at least one media to create an Exploitation Right');
    }
    if (formValue.territory.some(territory => !territories.find((key) => key === territory))) {
      throw new Error('One or more selected territories are not available');
    }
    return true;
  }

  public rightExist(formValue: AvailsSearch, titleRights: DistributionRight[]): boolean {
    const rightsInDateRange = getRightsInDateRange(formValue.terms, titleRights);
    const matchingRights = getFilterMatchingRights(formValue, rightsInDateRange);
    return matchingRights.length ? true : false;
  }
}
