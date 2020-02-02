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
  public country: any;
  public countries$ = new BehaviorSubject([]);


  constructor() { }

  public select(e) {
    this.countries$.next([...this.countries$.getValue(), e['iso_a3'] ]);
    console.log(this.countries$.getValue());
  }

  public getTerritorySlugFromGeoJson(code: string) {
    return getTerritorySlugFromGeoJson(code);
  }

  public getTerritoryLabelFromGeoJson(code: string) {
    return getTerritoryLabelFromGeoJson(code);
  }
}
