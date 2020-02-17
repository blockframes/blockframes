import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { AvailsSearchForm } from '@blockframes/catalog';
import { MovieQuery, Movie } from '@blockframes/movie/movie/+state';
import { Observable } from 'rxjs/internal/Observable';
import { switchMap } from 'rxjs/operators';
import { EnhancedISO3166Territory } from '@blockframes/utils/static-model/territories-ISO-3166';
import { getNotLicensedTerritories, getAvailableTerritories, getRightsSoldTerritories } from './territories-filter';
import { DistributionDealService, DistributionDeal } from '@blockframes/movie/distribution-deals/+state';
import { MatSnackBar } from '@angular/material';
import { MarketplaceStore, MarketplaceQuery } from '../../+state';
import { getSlugByIsoA3, getIsoA3bySlug, Model } from '@blockframes/utils/static-model/staticModels';
import { staticModels } from '@blockframes/utils/static-model';
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

  public notLicensedTerritories$: Observable<Model['TERRITORIES']>;
  public rightsSoldTerritories: Model['TERRITORIES'] = [];
  public availableTerritories: Model['TERRITORIES'] = [];

  constructor(
    private movieQuery: MovieQuery,
    private dealService: DistributionDealService,
    private marketplaceStore: MarketplaceStore,
    private marketplaceQuery: MarketplaceQuery,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    this.notLicensedTerritories$ = this.movieQuery.selectActive().pipe(
      switchMap(async movie => {
        if (!movie.distributionDeals) {
          return this.territories;
        }
        const mandateDeals = await this.dealService.getMandateDeals(movie);
        return getNotLicensedTerritories(mandateDeals, this.territories);
      })
    );
  }

  /** Whenever you click on a territory, add it to availsForm.territories. */
  public select(territory: EnhancedISO3166Territory) {
    const territorySlug = getSlugByIsoA3(territory['iso_a3']);
    this.availsForm.addTerritory(territorySlug);
  }

  /** Get a list of iso_a3 strings from the territories of the form. */
  public get territoriesIsoA3(): string[] {
    return this.availsForm.territories.value.map(territorySlug => getIsoA3bySlug(territorySlug));
  }

  public trackByTag(tag) {
    return tag;
  }

  /** Apply filters and display results on the world map. */
  public async applyAvailsFilter() {
    try {
      if (this.availsForm.invalid) {
        throw new Error('Please fill all the required fields');
      }

      this.availsForm.get('isActive').setValue(true);

      if (!this.movie.distributionDeals || !this.availsForm.value.isActive) {
        throw new Error('Archipel Content got no mandate on this movie');
      }

      const mandateDeals = await this.dealService.getMandateDeals(this.movie);
      const mandateDealIds = mandateDeals.map(deal => deal.id);
      const filteredDeals = this.movie.distributionDeals.filter(
        deal => !mandateDealIds.includes(deal.id)
      );

      this.availableTerritories = getAvailableTerritories(
        this.availsForm.value,
        mandateDeals,
        this.territories,
        filteredDeals
      );

      this.rightsSoldTerritories = getRightsSoldTerritories(
        this.availsForm.value,
        mandateDeals,
        this.territories,
        filteredDeals
      );

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

  public addDeal() {
    this.availsForm.enable();
    this.availsForm.get('isActive').setValue(false);

    try {

      switch (true) {
        case !this.availsForm.terms.value.start || !this.availsForm.terms.value.end:
          throw new Error('Fill terms "Start Date" and "End Date" in order to create an Exploitation Right');
        case !this.availsForm.territories.value.length:
          throw new Error('Select at least one available territory to create an Exploitation Right');
        case !this.availsForm.medias.value.length:
          throw new Error('Select at least one media to create an Exploitation Right');
        default:
          break;
      }

      // Create a distribution deal from the avails form values.
      const distributionDeal: DistributionDeal = this.dealService.createCartDeal(this.availsForm);

      // If title don't exist in the marketplace store, create one.
      if (!this.marketplaceQuery.getEntity(this.movie.id)) {
        this.marketplaceStore.setTitleCart(this.movie.id);
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

}
