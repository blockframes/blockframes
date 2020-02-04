import { Component, AfterViewInit, ViewChild, ElementRef, ChangeDetectionStrategy, ChangeDetectorRef, NgZone, Input } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Movie } from '@blockframes/movie/movie+state';
import { geoJSON, GeoJSON, Layer } from 'leaflet';
import { getTerritorySlugFromGeoJson, getTerritoryLabelFromGeoJson } from '@blockframes/utils/static-model/territories-ISO-3166';
import { ISO3166TERRITORIES } from '@blockframes/utils/static-model/territories-ISO-3166';
import { BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';

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
  public country$ = this.country.asObservable();
  // Countries you want to display in blue on the map
  public countries$ = new BehaviorSubject(['RUS', 'ZAF']);
  public contract$ = this.country$.pipe(
    map(tag => getTerritorySlugFromGeoJson(tag))
    // map(country => IMPLEMENT MAPPING LOGIC HERE TO GET THE RIGHT CONTENT)
  );

  constructor(private cdr: ChangeDetectorRef) { }

  /** Whenever you click on a country */
  public select(e) {
    this.country.next(e['iso_a3']);
  }

  public trackByTag(tag) {
    return tag;
  }

}
