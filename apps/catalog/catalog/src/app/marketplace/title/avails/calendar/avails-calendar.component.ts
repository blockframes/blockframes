
import { ChangeDetectionStrategy, Component } from '@angular/core';

import { MatSnackBar } from '@angular/material/snack-bar';

import { combineLatest, Observable } from 'rxjs';
import { filter, map, shareReplay, startWith } from 'rxjs/operators';

import {
  getDurations,
  getSoldTerms,
  DurationMarker,
  toDurationMarker,
  getDurationMarkers,
} from '@blockframes/contract/avails/avails';
import { MovieQuery } from '@blockframes/movie/+state';
import { OrganizationService } from '@blockframes/organization/+state';

import { MarketplaceMovieAvailsComponent } from '../avails.component';


@Component({
  selector: 'catalog-movie-avails-calendar',
  templateUrl: './avails-calendar.component.html',
  styleUrls: ['./avails-calendar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MarketplaceMovieAvailsCalendarComponent {

  public availsForm = this.shell.avails.calendarForm;

  public org$ = this.orgService.valueChanges(this.movieQuery.getActive().orgIds[0]);

  public status$ = this.availsForm.statusChanges.pipe(startWith(this.availsForm.status));

  private mandates$ = this.shell.mandates$;

  private mandateTerms$ = this.shell.mandateTerms$;
  private salesTerms$ = this.shell.salesTerms$;

  public selected$: Observable<DurationMarker> = combineLatest([
    this.availsForm.value$,
    this.shell.bucketForm.value$,
  ]).pipe(
    map(([avail, bucket]) => getDurations(this.shell.movie.id, avail, bucket, 'exact')[0]),
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
    private snackbar: MatSnackBar,
    private movieQuery: MovieQuery,
    private orgService: OrganizationService,
    private shell: MarketplaceMovieAvailsComponent,
  ) { }

  clear() {
    this.availsForm.reset();
  }

  async selected(marker: DurationMarker) {
    const avails = { ...this.availsForm.value, duration: { from: marker.from, to: marker.to } };

    const result = this.shell.bucketForm.getTermIndexForCalendar(avails, marker);
    if (result) {
      const contract = this.shell.bucketForm.get('contracts').get(result.contractIndex.toString());
      const term = contract.get('terms').get(result.termIndex.toString());
      term.setValue({ ...term.value, ...avails });
    } else {
      this.shell.bucketForm.addDuration(avails, marker);
    }

    this.snackbar.open(`Rights ${ result ? 'updated' : 'added' }`, 'Show ⇩', { duration: 5000 })
      .onAction()
      .subscribe(() => {
        document.querySelector('#rights').scrollIntoView({ behavior: 'smooth' })
      });
  }
}
