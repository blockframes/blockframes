import { MovieQuery, Movie } from '@blockframes/movie/+state';
import { Component, ChangeDetectionStrategy } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MarketplaceStore, MarketplaceQuery } from '../../+state';
import { TerritoryValue, Territory } from '@blockframes/utils/static-model';
import { territories, territoriesISOA3 } from '@blockframes/utils/static-model';

@Component({
  selector: 'catalog-movie-avails',
  templateUrl: './avails.component.html',
  styleUrls: ['./avails.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MarketplaceMovieAvailsComponent {
  public availsForm
  public movie: Movie = this.movieQuery.getActive();
  public territories = territories;

  /** List of world map territories */
  public notLicensedTerritories: Territory[] = [];
  public rightsSoldTerritories: Territory[] = [];
  public availableTerritories: Territory[] = [];

  public hoveredTerritory: {
    name: string;
    status: string;
  }

  constructor(
    private movieQuery: MovieQuery,
    private marketplaceStore: MarketplaceStore,
    private marketplaceQuery: MarketplaceQuery,
    private snackBar: MatSnackBar
  ) { }

  /** Whenever you click on a territory, add it to availsForm.territories. */
  public select(territory: Territory) {
    const territorySlug = territoriesISOA3[territory];
    this.availsForm.addTerritory(territorySlug);
  }

  /** Get a list of iso_a3 strings from the territories of the form. */
  public get territoriesIsoA3(): string[] {
    return this.availsForm.territory.value.map(territorySlug => territoriesISOA3[territorySlug]);
  }

  public trackByTag(tag) {
    return tag;
  }

  /** Apply filters and display results on the world map. */
  public async applyAvailsFilter() {
    try {
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

      // If title don't exist in the marketplace store, create one.
      if (!this.marketplaceQuery.getEntity(this.movie.id)) {
        this.marketplaceStore.addTitle(this.movie.id);
      }

      this.snackBar.open('Exploitation Rights added to your Selection', 'close', {
        duration: 3000
      });

    } catch (error) {
      this.snackBar.open(error.message, 'close', { duration: 3000 });
    }
  }

  /** Display the territories information in the tooltip */
  public dislpayTerritoryTooltip(territory: TerritoryValue, status: string) {
    this.hoveredTerritory = { name: territory, status }
  }

  /** Clear the territories information */
  public clearTerritoryTooltip() {
    this.hoveredTerritory = null;
  }

}
