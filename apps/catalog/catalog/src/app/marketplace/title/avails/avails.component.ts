import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { AvailsSearchForm } from '@blockframes/catalog';
import { MovieQuery, Movie } from '@blockframes/movie/movie/+state';
import { Observable } from 'rxjs/internal/Observable';
import { BehaviorSubject } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { EnhancedISO3166Territory, ISO3166TERRITORIES } from '@blockframes/utils/static-model/territories-ISO-3166';
import { getNotLicensedTerritories, getAvailableTerritories, getRightsSoldTerritories } from './territories-filter';
import { DistributionDealService } from '@blockframes/movie/distribution-deals/+state';
import { MatSnackBar } from '@angular/material';
import { DistributionDealForm } from '@blockframes/movie/distribution-deals/form/distribution-deal.form';

@Component({
  selector: 'catalog-movie-avails',
  templateUrl: './avails.component.html',
  styleUrls: ['./avails.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MarketplaceMovieAvailsComponent implements OnInit {
  public availsForm: AvailsSearchForm = new AvailsSearchForm();
  public dealForm: DistributionDealForm = new DistributionDealForm();
  public movie: Movie = this.movieQuery.getActive();
  public territories = ISO3166TERRITORIES;

  /* Observable of all territories */
  public territorySearchResults$: Observable<EnhancedISO3166Territory[]>;

  // Selected country on the map
  private country = new BehaviorSubject('');
  public country$ = this.country.asObservable();

  public notLicensedTerritories$: Observable<EnhancedISO3166Territory[]>;
  public rightsSoldTerritories: EnhancedISO3166Territory[] = [];
  public availableTerritories: EnhancedISO3166Territory[] = [];

  constructor(private movieQuery: MovieQuery, private dealService: DistributionDealService, private snackBar: MatSnackBar) { }

  ngOnInit() {
    this.notLicensedTerritories$ = this.movieQuery.selectActive().pipe(
      switchMap(async movie => {
        if (!movie.distributionDeals) {
          return this.territories;
        }
        const mandateDeals = await this.dealService.getMandateDeals(movie);
        return getNotLicensedTerritories(mandateDeals, this.territories)
      })
    )

  }

  /** Whenever you click on a country */
  public select(e) {
    this.country.next(e['iso_a3']);
  }

  public trackByTag(tag) {
    return tag;
  }

  public async applyAvailsFilter(){
    this.availsForm.get('isActive').setValue(true)
    if (!this.movie.distributionDeals || !this.availsForm.value.isActive) {
      this.snackBar.open('Archipel Content got no mandate on this movie', 'close', { duration: 3000 });
      return;
    }
    const mandateDeals = await this.dealService.getMandateDeals(this.movie);
    const mandateDealIds = mandateDeals.map(deal => deal.id);
    const filteredDeals = this.movie.distributionDeals.filter(deal => !mandateDealIds.includes(deal.id));

    this.availableTerritories = getAvailableTerritories(this.availsForm.value, mandateDeals, this.territories, filteredDeals)
    this.rightsSoldTerritories = getRightsSoldTerritories(this.availsForm.value, mandateDeals, this.territories, filteredDeals)

    this.dealForm.get('licenseType').setValue(this.availsForm.value.medias);
    this.dealForm.get('exclusive').setValue(this.availsForm.value.exclusivity);
    this.dealForm.get('terms').setValue(this.availsForm.value.terms);

    this.availsForm.disable();
  }

  public deactivateAvailsFilter(){
    this.availsForm.get('isActive').setValue(false);
    this.availsForm.enable();
  }

  public addDeal() {
    console.log(this.dealForm.value)
  }

}
