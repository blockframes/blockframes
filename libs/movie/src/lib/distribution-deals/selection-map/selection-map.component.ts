import { Component, AfterViewInit, ViewChild, ElementRef, ChangeDetectionStrategy, ChangeDetectorRef, NgZone, Input } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Movie } from '@blockframes/movie/movie+state';
import { map, geoJSON, GeoJSON, Layer } from 'leaflet';
import { getTerritorySlugFromGeoJson, getTerritoryLabelFromGeoJson } from '@blockframes/utils/static-model/territories-ISO-3166';

@Component({
  selector: 'distribution-deals-selection-map',
  templateUrl: './selection-map.component.html',
  styleUrls: ['./selection-map.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SelectionMapComponent implements AfterViewInit {

  @Input() movie: Movie;
  private geojson: GeoJSON;
  private layer: Layer;
  public country: any;

  @ViewChild('leaflet', { static: false }) leafletEl: ElementRef;

  constructor(
    private http: HttpClient,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone
  ) { }

  async ngAfterViewInit() {
    const world = map(this.leafletEl.nativeElement, { zoomSnap: 0.5, attributionControl: false }).setView([40, 40], 1.5);
    const countries = await this.http.get<GeoJSON.GeoJsonObject>('assets/maps/world.geo.json').toPromise();
    this.geojson = geoJSON(countries, {
      style: this.setStyle.bind(this),
      onEachFeature: this.addFeature.bind(this)
    });
    this.geojson.addTo(world);
  }

  /** Set the default style of this  */
  private setStyle(feature: GeoJSON.Feature) {
    return {
      fillColor: '#ECEFF9',
      weight: 1,
      color: '#000000A0',
      fillOpacity: 1
    };
  }

  private addFeature(feature: GeoJSON.Feature, layer: Layer): void {
    this.ngZone.runOutsideAngular(() => {
      layer.on({
        mouseover: ({ target }) => {
          if (layer !== this.layer) {
            target.setStyle({ fillColor: '#8788A3' });
          }
        },
        mouseout: () => {
          if (layer !== this.layer) {
            this.geojson.resetStyle(layer);
          }
        },
        click: ({ target }) => {
          this.geojson.resetStyle(this.layer);
          this.layer = layer;
          this.country = feature.properties;
          this.cdr.markForCheck();
          target.setStyle({ fillColor: '#334AEC' });
        }
      });
    })
  }

  public getTerritorySlugFromGeoJson(code: string) {
    return getTerritorySlugFromGeoJson(code);
  }

  public getTerritoryLabelFromGeoJson(code: string) {
    return getTerritoryLabelFromGeoJson(code);
  }
}
