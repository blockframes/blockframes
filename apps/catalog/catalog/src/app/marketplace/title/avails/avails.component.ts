import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { AvailsSearchForm } from '@blockframes/catalog';
import { MovieQuery, Movie } from '@blockframes/movie/movie/+state';
import { EnhancedISO3166Territory } from '@blockframes/utils/static-model/territories-ISO-3166';
import { getNotLicensedTerritories, getAvailableTerritories, getRightsSoldTerritories } from './territories-filter';
import { DistributionDealService, DistributionDeal, createDistributionDeal } from '@blockframes/movie/distribution-deals/+state';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MarketplaceStore, MarketplaceQuery } from '../../+state';
import { getSlugByIsoA3, getIsoA3bySlug, Model } from '@blockframes/utils/static-model/staticModels';
import { staticModels, TerritoriesLabel } from '@blockframes/utils/static-model';
import { arrayAdd } from '@datorama/akita';

@Component({
  selector: 'catalog-movie-avails',
  templateUrl: './avails.component.html',
  styleUrls: ['./avails.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MarketplaceMovieAvailsComponent implements OnInit {
  public availsForm: AvailsSearchForm = new AvailsSearchForm();
  public movie: Movie = this.movieQuery.getActive();
  public territories = staticModels['TERRITORIES'];

  /** List of world map territories */
  public notLicensedTerritories: Model['TERRITORIES'] = [];
  public rightsSoldTerritories: Model['TERRITORIES'] = [];
  public availableTerritories: Model['TERRITORIES'] = [];

  public hoveredTerritory: {
    name: string;
    status: string;
  }

  constructor(
    private movieQuery: MovieQuery,
    private dealService: DistributionDealService,
    private marketplaceStore: MarketplaceStore,
    private marketplaceQuery: MarketplaceQuery,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
  }

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
      if (this.availsForm.invalid || !this.availsForm.value.licenseType.length) {
        throw new Error('Please fill all the required fields (Terms and Media)');
      }

      this.availsForm.get('isActive').setValue(true);

      if (!this.movie.distributionDeals) {
        throw new Error('Archipel Content got no mandate on this movie');
      }

      const mandateDeals = await this.dealService.getMandateDeals(this.movie);
      const mandateDealIds = mandateDeals.map(deal => deal.id);
      const filteredDeals = this.movie.distributionDeals.filter(
        deal => !mandateDealIds.includes(deal.id)
      );

      this.notLicensedTerritories = getNotLicensedTerritories(this.availsForm.value, mandateDeals)
      this.availableTerritories = getAvailableTerritories(this.availsForm.value, mandateDeals, filteredDeals);
      this.rightsSoldTerritories = getRightsSoldTerritories(this.availsForm.value, mandateDeals, filteredDeals);

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

  /** Add a distribution deal to the user selection for the active movie. */
  public addDeal() {
    try {

      // Verify the form values and throw errors if some are missing/incorrect.
      this.dealService.verifyDeal(this.availsForm.getRawValue(), this.availableTerritories)

      // Then check if the deal in preparation doesn't match an already existing deal.
      const dealsInStore = this.marketplaceQuery.getTitleDeals(this.movie.id);
      if (this.dealService.dealExist(this.availsForm.getRawValue(), dealsInStore)) {
        throw new Error('You already got an Exploitation Right for this availability');
      }


      // Create a distribution deal from the avails form values.
      const { terms, licenseType, territory, territoryExcluded, exclusive } = this.availsForm.getRawValue()
      const distributionDeal: DistributionDeal = createDistributionDeal(
        { terms, licenseType, territory, territoryExcluded, exclusive }
      );

      // If title don't exist in the marketplace store, create one.
      if (!this.marketplaceQuery.getEntity(this.movie.id)) {
        this.marketplaceStore.addTitle(this.movie.id);
      }

      // Update the title with the new deal.
      this.marketplaceStore.update(this.movie.id, title => ({
        deals: arrayAdd(title.deals, distributionDeal)
      }));

      this.snackBar.open('Exploitation Rights added to your Selection', 'close', {
        duration: 3000
      });

    } catch (error) {
      this.snackBar.open(error.message, 'close', { duration: 3000 });
    }
  }

  /** Display the territories information in the tooltip */
  public dislpayTerritoryTooltip(territory: TerritoriesLabel, status: string) {
    this.hoveredTerritory = { name: territory, status}
  }

  /** Clear the territories information */
  public clearTerritoryTooltip() {
    this.hoveredTerritory = null;
  }

}
