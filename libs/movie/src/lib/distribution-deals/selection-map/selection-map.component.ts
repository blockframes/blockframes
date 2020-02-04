import { Component, AfterViewInit, ViewChild, ElementRef, ChangeDetectionStrategy, ChangeDetectorRef, NgZone, Input } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Movie } from '@blockframes/movie/movie+state';
import { map, geoJSON, GeoJSON, Layer } from 'leaflet';
import { getTerritorySlugFromGeoJson, getTerritoryLabelFromGeoJson } from '@blockframes/utils/static-model/territories-ISO-3166';
import { ISO3166TERRITORIES } from '@blockframes/utils/static-model/territories-ISO-3166';
import { BehaviorSubject } from 'rxjs';

const territories = ISO3166TERRITORIES.map(t => t['iso_a3']);

@Component({
  selector: 'distribution-deals-selection-map',
  templateUrl: './selection-map.component.html',
  styleUrls: ['./selection-map.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SelectionMapComponent {

  @Input() movie: Movie;
  // Selected country on the map
  private country = new BehaviorSubject('');
  public country$ = this.country.asObservable().pipe(
    // map(country => IMPLEMENT MAPPING LOGIC HERE TO GET THE RIGHT CONTENT)
  );
  // Countries you want to display in blue on the map
  public countries$ = new BehaviorSubject([]);


  constructor() { }

  /** Whenever you click on a country */
  public select(e) {
    const territory = getTerritorySlugFromGeoJson(e['iso_a3']);
    this.country.next(territory);
  }

}
