import { MovieQuery, Movie } from '@blockframes/movie/+state';
import { Component, ChangeDetectionStrategy } from '@angular/core';
import { TerritoryValue, TerritoryISOA3Value } from '@blockframes/utils/static-model';
import { territories, territoriesISOA3 } from '@blockframes/utils/static-model';

interface TerritoryMarker {
  isoA3: TerritoryISOA3Value,
  label: TerritoryValue
}

@Component({
  selector: 'catalog-movie-avails',
  templateUrl: './avails.component.html',
  styleUrls: ['./avails.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MarketplaceMovieAvailsComponent {
  public movie: Movie = this.movieQuery.getActive();

  /** List of world map territories */
  public notLicensedTerritories: TerritoryMarker[] = [];
  public rightsSoldTerritories: TerritoryMarker[] = [];
  public availableTerritories: TerritoryMarker[] = [];

  public hoveredTerritory: {
    name: string;
    status: string;
  }

  constructor(
    private movieQuery: MovieQuery,
  ) {
    /**
     * @dev this is an example. France will be selected in map, if your 
     * mouse is over the tooltip is displayed (right top)
     * if you click on it, selected territory is in browser console.
     */
    this.rightsSoldTerritories.push({ isoA3: territoriesISOA3.netherlands, 'label': territories.netherlands });
    this.availableTerritories.push({ isoA3: territoriesISOA3.france, 'label': territories.france });
  }

  /** Whenever you click on a territory, add it to availsForm.territories. */
  public select(territory: any) { // @TODO #5647 find correct typing
    console.log(territory);
  }

  /** Get a list of iso_a3 strings from the territories of the form. */
  public get territoriesIsoA3(): string[] {
    /** @dev this is an example. */
    return [territoriesISOA3['united-states-of-america']];
    //return this.availsForm.territory.value.map(territorySlug => territoriesISOA3[territorySlug]);
  }

  public trackByTag(tag) {
    return tag;
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
