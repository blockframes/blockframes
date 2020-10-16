import { Component, ChangeDetectionStrategy, ChangeDetectorRef, Input } from '@angular/core';
import { Movie } from '@blockframes/movie/+state';
import { getTerritorySlugFromGeoJson } from '@blockframes/utils/static-model/static-model';
import { BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: 'distribution-rights-selection-map',
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
