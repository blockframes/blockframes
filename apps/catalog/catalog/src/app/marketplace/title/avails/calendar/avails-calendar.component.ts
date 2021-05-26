
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { combineLatest } from 'rxjs';
import { MovieQuery } from '@blockframes/movie/+state';
import { OrganizationService } from '@blockframes/organization/+state';
import { DurationMarker, getDurations, getSoldTerms, getDurationMarkers, toDurationMarker, AvailsFilter } from '@blockframes/contract/avails/avails';

import { MarketplaceMovieAvailsComponent } from '../avails.component';
import { filter, map, shareReplay, startWith, take } from 'rxjs/operators';
import { Bucket } from '@blockframes/contract/bucket/+state';
import { Duration } from '@blockframes/contract/term/+state/term.model';

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

  public status$ = this.availsForm.statusChanges.pipe(startWith(this.availsForm.valid ? 'VALID' : 'INVALID'));

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

  public licensed$ = combineLatest([
    this.mandates$,
    this.mandateTerms$,
    this.availsForm.value$
  ]).pipe(
    map(([mandates, mandateTerms]) => {
      if (this.availsForm.invalid) return [];
      return getDurationMarkers(mandates, mandateTerms);
    }),
    shareReplay(1),
  );

  constructor(
    private movieQuery: MovieQuery,
    private orgService: OrganizationService,
    private shell: MarketplaceMovieAvailsComponent,
  ) { }

  clear() {
    this.availsForm.reset();
  }

  async selected(duration: Duration<Date>) {
    const licensed = await this.licensed$.pipe(take(1)).toPromise();
    const avails = { ...this.availsForm.value, duration };

    for (const marker of licensed) {
      const result = this.shell.bucketForm.getTermIndexForCalendar(avails, marker);
      if (result) {
        const contract = this.shell.bucketForm.get('contracts').get(result.contractIndex.toString());
        const term = contract.get('terms').get(result.termIndex.toString());
        term.setValue({ ...term.value, ...avails });
      } else {
        this.shell.bucketForm.addDuration(avails, { ...marker, ...duration });
      }
    }
  }
}
