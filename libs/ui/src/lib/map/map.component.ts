import {
  Component,
  AfterViewInit,
  ElementRef,
  EventEmitter,
  Input,
  ContentChildren,
  Directive,
  QueryList,
  Output,
  ChangeDetectionStrategy,
  OnDestroy
} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map as toMap, geoJSON, Path, PathOptions } from 'leaflet';
import { Subscription, BehaviorSubject, combineLatest } from 'rxjs';
import { startWith, switchMap, map } from 'rxjs/operators';
import { boolean } from '@blockframes/utils/decorators/decorators';

@Directive({
  selector: 'map-feature, [mapFeature]'
})
// eslint-disable-next-line
export class MapFeature {

  state$ = new BehaviorSubject<PathOptions>({});
  set state(state: Partial<PathOptions>) {
    this.state$.next({ ...this.state$.getValue(), ...state });
  }
  get state() {
    return this.state$.getValue();
  }

  tag$ = new BehaviorSubject('');

  @Input()
  set color(color: string) {
    if (!color) this.state = { fillOpacity: 0 };
    if (color.startsWith('#')) {
      this.state = { fillColor: color, fillOpacity: 1 };
    } else {
      this.state = { fillColor: `var(--${color})`, fillOpacity: 1 };
    }
  }
  @Input()
  set weight(value: string | number) {
    const weight = typeof value === "string" ? parseInt(value) : (value ?? 1);
    const stroke = weight !== 0;
    this.state = stroke ? { weight: weight ? weight : 1, stroke } : { stroke }
  }
  @Input()
  set tag(tag: string) {
    this.tag$.next(tag);
  }
  get tag(): string {
    return this.tag$.getValue();
  }
  // eslint-disable-next-line
  @Output() mouseover = new EventEmitter();
  // eslint-disable-next-line
  @Output() mouseout = new EventEmitter();
  // eslint-disable-next-line
  @Output() click = new EventEmitter(true);
}

@Component({
  selector: 'world-map',
  template: '<ng-content></ng-content>',
  styles: [`:host { display: block; background-color: var(--background-card);}`],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MapComponent implements AfterViewInit, OnDestroy {
  private sub: Subscription;
  layers: Record<string, Path> = {};

  @Input() featureTag = 'iso_a3';
  @Input() @boolean disableSelect=false;

  // eslint-disable-next-line
  @Output() select = new EventEmitter();
  @ContentChildren(MapFeature, { descendants: true }) features: QueryList<MapFeature>

  constructor(
    private el: ElementRef,
    private http: HttpClient,
  ) { }

  async ngAfterViewInit() {
    const world = toMap(this.el.nativeElement, {
      zoomSnap: 0.5,
      attributionControl: false,
      scrollWheelZoom: false
    }).setView([40, 40], 1.5);
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
        // Reset all previous tags
        tags.filter(tag => this.layers[tag]).forEach(tag => this.layers[tag].setStyle(this.setStyle()));
        // Listen on changes of color & tag
        return combineLatest(features.map(f => combineLatest([f.state$, f.tag$]).pipe(map(() => f))))
      })
    ).subscribe((features: MapFeature[]) => {
      // Add new style
      features.forEach(({ state, tag }) => {
        if (this.layers[tag]) {
          this.layers[tag].setStyle(state);
        }
      });
      // Keep in memory all current tags
      tags = features.map(({ tag }) => tag);
    });
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }

  /** Set the default style of this  */
  private setStyle(): PathOptions {
    return {
      fillOpacity: 0,
      stroke: true,
      weight: 1,
      color: '#06081c',
      className:this.disableSelect? 'no-cursor': '',
    };
  }

  private addFeature(feature: GeoJSON.Feature, layer: Path): void {
    const getFeature = () => this.features.find(({ tag }) => {
      return tag.toLowerCase() === feature.properties[this.featureTag].toLowerCase();
    })
    this.layers[feature.properties[this.featureTag]] = layer;
    layer.on({
      mouseover: () => {
        const el = getFeature();
        if (el) {
          el.mouseover.emit(feature.properties)
        }
      },
      mouseout: () => {
        const el = getFeature();
        if (el) {
          el.mouseout.emit(feature.properties)
        }
      },
      click: () => {
        const el = getFeature();
        el
          ? el.click.emit(feature.properties)
          : this.select.emit(feature.properties);
      }
    });
  }
}

