import { AvailsSearchForm } from '@blockframes/distribution-rights/form/search.form';
import { MovieQuery, Movie } from '@blockframes/movie/+state';
import { Component, ChangeDetectionStrategy } from '@angular/core';
import { EnhancedISO3166Territory } from '@blockframes/utils/static-model/territories-ISO-3166';
import { getNotLicensedTerritories, getAvailableTerritories, getRightsSoldTerritories } from './territories-filter';
import { DistributionRightService, DistributionRight, createDistributionRight } from '@blockframes/distribution-rights/+state';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MarketplaceStore, MarketplaceQuery } from '../../+state';
import { getSlugByIsoA3, getIsoA3bySlug } from '@blockframes/utils/static-model/staticModels';
import { Territories, TerritoriesValues } from '@blockframes/utils/static-model';
import { arrayAdd } from '@datorama/akita';
import { areTermsValid } from '@blockframes/distribution-rights/form/terms/terms.form';
import { territories } from '@blockframes/utils/static-model/staticConsts';

@Component({
  selector: 'catalog-movie-avails',
  templateUrl: './avails.component.html',
  styleUrls: ['./avails.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MarketplaceMovieAvailsComponent {
  public availsForm: AvailsSearchForm = new AvailsSearchForm();
  public movie: Movie = this.movieQuery.getActive();
  public territories = territories;

  /** List of world map territories */
  public notLicensedTerritories: Territories[] = [];
  public rightsSoldTerritories: Territories[] = [];
  public availableTerritories: Territories[] = [];

  public hoveredTerritory: {
    name: string;
    status: string;
  }

  constructor(
    private movieQuery: MovieQuery,
    private rightService: DistributionRightService,
    private marketplaceStore: MarketplaceStore,
    private marketplaceQuery: MarketplaceQuery,
    private snackBar: MatSnackBar
  ) { }

  /** Whenever you click on a territory, add it to availsForm.territories. */
  public select(territory: EnhancedISO3166Territory) {
    const territorySlug = getSlugByIsoA3(territory['iso_a3']);
    this.availsForm.addTerritory(territorySlug);
  }

  /** Get a list of iso_a3 strings from the territories of the form. */
  public get territoriesIsoA3(): string[] {
    return this.availsForm.territory.value.map(territorySlug => getIsoA3bySlug(territorySlug));
  }

  public trackByTag(tag) {
    return tag;
  }

  /** Apply filters and display results on the world map. */
  public async applyAvailsFilter() {
    try {
      // TODO: bind every controls to the form to avoid tricky error handling => ISSUE#1942
      // Check if terms are valid, throw an error in the snackbar if not
      areTermsValid(this.availsForm.value.terms);
      if (!this.availsForm.value.licenseType.length) {
        throw new Error('Please fill all the required fields (Terms and Media)');
      }

      this.availsForm.get('isActive').setValue(true);
      if (!this.movie.distributionRights) {
        throw new Error('Archipel Content got no mandate on this movie');
      }

      const mandateRights = await this.rightService.getMandateRights(this.movie);
      const mandateRightIds = mandateRights.map(right => right.id);
      const filteredRights = this.movie.distributionRights.filter(
        right => !mandateRightIds.includes(right.id)
      );

      this.notLicensedTerritories = getNotLicensedTerritories(this.availsForm.value, mandateRights)
      this.availableTerritories = getAvailableTerritories(this.availsForm.value, mandateRights, filteredRights);
      this.rightsSoldTerritories = getRightsSoldTerritories(this.availsForm.value, mandateRights, filteredRights);

      this.availsForm.disable();
    } catch (error) {
      this.snackBar.open(error.message, 'close', { duration: 3000 });
    }
  }

  /** Reenable the form for a new search. */
  // TODO: bind every controls to the form to avoid tricky disable => ISSUE#1942
  public deactivateAvailsFilter() {
    this.availsForm.get('isActive').setValue(false);
    this.availsForm.enable();
  }

  /** Add a distribution right to the user selection for the active movie. */
  public addRight() {
    try {
      // Verify the form values and throw errors if some are missing/incorrect.
      this.rightService.verifyRight(this.availsForm.getRawValue(), this.availableTerritories)

      // Then check if the right in preparation doesn't match an already existing right.
      const rightsInStore = this.marketplaceQuery.getTitleRights(this.movie.id);
      if (this.rightService.rightExist(this.availsForm.getRawValue(), rightsInStore)) {
        throw new Error('You already got an Exploitation Right for this availability');
      }

      // Create a distribution right from the avails form values.
      const { terms, licenseType, territory, territoryExcluded, exclusive } = this.availsForm.getRawValue()
      const distributionRight: DistributionRight = createDistributionRight(
        { terms, licenseType, territory, territoryExcluded, exclusive }
      );

      // If title don't exist in the marketplace store, create one.
      if (!this.marketplaceQuery.getEntity(this.movie.id)) {
        this.marketplaceStore.addTitle(this.movie.id);
      }

      // Update the title with the new right.
      this.marketplaceStore.update(this.movie.id, title => ({
        rights: arrayAdd(title.rights, distributionRight)
      }));

      this.snackBar.open('Exploitation Rights added to your Selection', 'close', {
        duration: 3000
      });

    } catch (error) {
      this.snackBar.open(error.message, 'close', { duration: 3000 });
    }
  }

  /** Display the territories information in the tooltip */
  public dislpayTerritoryTooltip(territory: TerritoriesValues, status: string) {
    this.hoveredTerritory = { name: territory, status }
  }

  /** Clear the territories information */
  public clearTerritoryTooltip() {
    this.hoveredTerritory = null;
  }

}
