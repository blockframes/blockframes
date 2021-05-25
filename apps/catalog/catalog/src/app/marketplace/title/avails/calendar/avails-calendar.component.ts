
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { combineLatest } from 'rxjs';
import { MovieQuery } from '@blockframes/movie/+state';
import { OrganizationService } from '@blockframes/organization/+state';
import { DurationMarker, getDurations, getSoldTerms, getDurationMarkers, toDurationMarker, availableDurations, AvailsFilter } from '@blockframes/contract/avails/avails';
import { MarketplaceMovieAvailsComponent } from '../avails.component';
import { filter, map, startWith } from 'rxjs/operators';
import { Bucket } from '@blockframes/contract/bucket/+state/bucket.model';

function getSelected(avail: AvailsFilter, bucket: Bucket, markers: DurationMarker[], mode: 'exact' | 'in') {
  const inDurations = getDurations(avail, bucket, mode);
  return markers.filter(marker => inDurations.some(duration =>(
    duration.from.getTime() === marker.from.getTime() &&
    duration.to.getTime() === duration.from.getTime()
  )));
}
@Component({
  selector: 'catalog-movie-avails-calendar',
  templateUrl: './avails-calendar.component.html',
  styleUrls: ['./avails-calendar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MarketplaceMovieAvailsCalendarComponent {

  public availsForm = this.shell.avails.calendarForm;

  public org$ = this.orgService.valueChanges(this.movieQuery.getActive().orgIds[0]);

  private mandates$ = this.shell.mandates$;
  private mandateTerms$ = this.shell.mandateTerms$;
  private salesTerms$ = this.shell.salesTerms$;

  public durationMarkers$ = combineLatest([
    this.shell.mandates$,
    this.mandateTerms$,
  ]).pipe(
    map(([mandates, mandateTerms]) => getDurationMarkers(mandates, mandateTerms))
  );

  public selected$ = combineLatest([
    this.availsForm.value$,
    this.shell.bucketForm.value$,
    this.durationMarkers$,
  ]).pipe(
    map(([avail, bucket, markers]) => getSelected(avail, bucket, markers, 'exact')),
    startWith<DurationMarker[]>([]),
  );

  public inSelection$ = combineLatest([
    this.availsForm.value$,
    this.shell.bucketForm.value$,
    this.durationMarkers$
  ]).pipe(
    map(([avail, bucket, markers]) => getSelected(avail, bucket, markers, 'in')),
    startWith<DurationMarker[]>([]),
  );

  public sold$ = combineLatest([
    this.mandates$,
    this.salesTerms$,
    this.availsForm.value$
  ]).pipe(
    filter(() => this.availsForm.valid),
    map(([mandates, sales, avails]) => {
      const soldTerms = getSoldTerms(avails, sales);
      return soldTerms.map(term => toDurationMarker(mandates, term)).flat();
    })
  );

  public available$ = combineLatest([
    this.mandates$,
    this.selected$,
    this.sold$,
    this.inSelection$,
    this.mandateTerms$
  ]).pipe(
    map(([mandates, selected, sold, inSelection, mandateTerms]) => {
      if (this.availsForm.invalid) return [];
      return availableDurations(selected, sold, inSelection, mandates, mandateTerms);
    })
  );

  constructor(
    private movieQuery: MovieQuery,
    private orgService: OrganizationService,
    private shell: MarketplaceMovieAvailsComponent,
  ) { }

  clear() {
    this.availsForm.reset();
  }
}
