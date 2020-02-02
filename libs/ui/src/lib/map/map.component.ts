import { Component, AfterViewInit, ViewChild, ElementRef, EventEmitter, ChangeDetectorRef, NgZone, Input, ContentChildren, Directive, QueryList, Output, ChangeDetectionStrategy, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, geoJSON, Layer } from 'leaflet';
import { Subscription } from 'rxjs';

@Directive({
  selector: 'map-feature, [mapFeature]'
})
// tslint:disable-next-line: directive-class-suffix
export class MapFeature {

  @Input() color: string;
  @Input() tag: string;
  @Output() mouseover = new EventEmitter();
  @Output() mouseout = new EventEmitter();
  @Output() click = new EventEmitter();
  
}

@Component({
  selector: 'world-map',
  template: '<ng-content></ng-content>',
  styles: [':host { display: block }'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MapComponent implements AfterViewInit, OnDestroy {
  private sub: Subscription;
  layers = {};
  
  @Input() featureTag = 'iso_a3';
  @Output() select = new EventEmitter();
  @ContentChildren(MapFeature, {descendants: true}) features: QueryList<MapFeature>

  constructor(
    private el: ElementRef,
    private http: HttpClient,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone
  ) { }

  async ngAfterViewInit() {
    const world = map(this.el.nativeElement, { zoomSnap: 0.5, attributionControl: false }).setView([40, 40], 1.5);
    const countries = await this.http.get<GeoJSON.GeoJsonObject>('assets/maps/world.geo.json').toPromise();
    const geojson = geoJSON(countries, {
      style: this.setStyle.bind(this),
      onEachFeature: this.addFeature.bind(this)
    });
    geojson.addTo(world);
    this.sub = this.features.changes.subscribe((features: QueryList<MapFeature>) => {
      features.forEach(({ color, tag }) => {
        if (!!this.layers[tag]) {
          this.layers[tag].setStyle({ fillColor: `var(--${color})` })
        }
      })
    });
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
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
    const getFeature = () => this.features.find(({ tag }) => {
      return tag.toLowerCase() === feature.properties[this.featureTag].toLowerCase();
    })
    this.layers[feature.properties[this.featureTag]] = layer;
      layer.on({
        mouseover: ({ target }) => {
          const el = getFeature();
          if (!!el) {
            el.mouseover.emit(feature.properties)
          }
        },
        mouseout: () => {
          const el = getFeature();
          if (!!el) {
            el.mouseout.emit(feature.properties)
          }
        },
        click: () => {
          const el = getFeature();
          !!el
            ? el.click.emit(feature.properties)
            : this.select.emit(feature.properties);
        }
      });
  }
}

