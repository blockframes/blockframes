import { Component, AfterViewInit, ViewChild, ElementRef, EventEmitter, ChangeDetectorRef, NgZone, Input, ContentChildren, Directive, QueryList, Output, ChangeDetectionStrategy, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map as toMap, geoJSON, Layer } from 'leaflet';
import { Subscription, BehaviorSubject, combineLatest } from 'rxjs';
import { startWith, switchMap, map } from 'rxjs/operators';

@Directive({
  selector: 'map-feature, [mapFeature]'
})
// tslint:disable-next-line: directive-class-suffix
export class MapFeature {

  color$ = new BehaviorSubject('');
  tag$ = new BehaviorSubject('');

  @Input()
  set color(color: string) {
    this.color$.next(color);
  }
  get color(): string {
    return this.color$.getValue();
  }
  @Input()
  set tag(tag: string) {
    this.tag$.next(tag);
  }
  get tag(): string {
    return this.tag$.getValue();
  }
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
  ) { }

  async ngAfterViewInit() {
    const world = toMap(this.el.nativeElement, { zoomSnap: 0.5, attributionControl: false }).setView([40, 40], 1.5);
    const countries = await this.http.get<GeoJSON.GeoJsonObject>('assets/maps/world.geo.json').toPromise();
    const geojson = geoJSON(countries, {
      style: this.setStyle.bind(this),
      onEachFeature: this.addFeature.bind(this)
    });
    geojson.addTo(world);

    // TODO(#1813) improve subscription system here
    let tags = [];
    this.sub = this.features.changes.pipe(
      startWith(this.features),
      switchMap((features: QueryList<MapFeature>) => {
        // Listen on changes of color & tag
        return combineLatest(features.map(f => combineLatest([f.color$, f.tag$]).pipe(map(_ => f))))
      })
    ).subscribe((features: MapFeature[]) => {
      // reset all previous tags
      tags.forEach(tag => this.layers[tag].setStyle({ fillColor: '#ECEFF9' }));
      // Add new style
      features.forEach(({ color, tag }) => this.layers[tag].setStyle({ fillColor: `var(--${color})` }));
      // Keep in memory all current tags
      tags = features.map(({ tag }) => tag);
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

