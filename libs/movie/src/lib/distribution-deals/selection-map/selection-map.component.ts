import { Component, OnInit, AfterViewInit, ViewChild, ElementRef, ChangeDetectionStrategy, ChangeDetectorRef, NgZone } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map , geoJSON, StyleFunction, GeoJSON, Map, control, Control, Layer } from 'leaflet';

const style: StyleFunction = (feature) => {
  return  {
    fillColor: '#ECEFF9',
    weight: 1,
    color: '#000000A0',
    fillOpacity: 1
  };
};


@Component({
  selector: 'distribution-deals-selection-map',
  templateUrl: './selection-map.component.html',
  styleUrls: ['./selection-map.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SelectionMapComponent implements OnInit, AfterViewInit {

  @ViewChild('leaflet', { static: false }) leafletEl: ElementRef;
  private geojson: GeoJSON;
  private selected: Layer;
  public country: any;

  constructor(
    private http: HttpClient,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone
  ) { }

  async ngOnInit() {

  }

  async ngAfterViewInit() {
    const world = map(this.leafletEl.nativeElement, { zoomSnap: 0.5, attributionControl: false }).setView([40, 40], 1.5);
    const countries = await this.http.get<GeoJSON.GeoJsonObject>('assets/maps/world.geo.json').toPromise();
    this.geojson = geoJSON(countries, {
      style,
      onEachFeature: this.addFeature.bind(this)
    });
    this.geojson.addTo(world);
  }

  private addFeature(feature: GeoJSON.Feature, layer: Layer): void {
    this.ngZone.runOutsideAngular(() => {
      layer.on({
        mouseover: ({ target }) => {
          if (layer !== this.selected) {
            target.setStyle({ fillColor: '#8788A3' });
          }
        },
        mouseout: () => {
          if (layer !== this.selected) {
            this.geojson.resetStyle(layer);
          }
        },
        click: ({ target }) => {
          this.geojson.resetStyle(this.selected);
          this.selected = layer;
          this.country = feature.properties;
          this.cdr.markForCheck();
          target.setStyle({ fillColor: '#334AEC' });
        }
      });
    })
  }
}
