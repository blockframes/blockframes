
import { AfterViewInit, ChangeDetectionStrategy, Component, OnDestroy } from '@angular/core';

import { MatSnackBar } from '@angular/material/snack-bar';

import { combineLatest, Observable, Subscription } from 'rxjs';
import { filter, map, shareReplay, startWith, throttleTime } from 'rxjs/operators';

import {
  getDurations,
  DurationMarker,
  toDurationMarker,
  getDurationMarkers,
  AvailsFilter,
  collidingTerms,
} from '@blockframes/contract/avails/avails';
import { MovieQuery } from '@blockframes/movie/+state';
import { OrganizationService } from '@blockframes/organization/+state';

import { MarketplaceMovieAvailsComponent } from '../avails.component';
import { ActivatedRoute, Router } from '@angular/router';
import { decodeUrl, encodeUrl } from '@blockframes/utils/form/form-state-url-encoder';
import { scrollIntoView } from '@blockframes/utils/browser/utils';


@Component({
  selector: 'catalog-movie-avails-calendar',
  templateUrl: './avails-calendar.component.html',
  styleUrls: ['./avails-calendar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MarketplaceMovieAvailsCalendarComponent implements AfterViewInit, OnDestroy {

  public availsForm = this.shell.avails.calendarForm;

  public org$ = this.orgService.valueChanges(this.movieQuery.getActive().orgIds[0]);

  public status$ = this.availsForm.statusChanges.pipe(startWith(this.availsForm.status));

  private mandates$ = this.shell.mandates$;
  private subs: Subscription[] = [];

  private mandateTerms$ = this.shell.mandateTerms$;
  private salesTerms$ = this.shell.salesTerms$;

  public selected$: Observable<DurationMarker> = combineLatest([
    this.availsForm.value$,
    this.shell.bucketForm.value$,
  ]).pipe(
    map(([avails, bucket]) => getDurations(this.shell.movie.id, avails, bucket, 'exact')[0]),
  );

  public inSelection$: Observable<DurationMarker[]> = combineLatest([
    this.availsForm.value$,
    this.shell.bucketForm.value$,
  ]).pipe(
    map(([avails, bucket]) => getDurations(this.shell.movie.id, avails, bucket, 'in')),
  );

  public sold$ = combineLatest([
    this.mandates$,
    this.salesTerms$,
    this.availsForm.value$,
  ]).pipe(
    filter(() => this.availsForm.valid),
    map(([mandates, salesTerms, avails]) => {
      const soldTerms = collidingTerms(avails, salesTerms);
      return soldTerms.map(term => toDurationMarker(mandates, term)).flat();
    })
  );

  public available$ = combineLatest([
    this.mandates$,
    this.mandateTerms$,
    this.availsForm.value$,
  ]).pipe(
    map(([mandates, mandateTerms]) => {
      if (this.availsForm.invalid) return [];
      return getDurationMarkers(mandates, mandateTerms);
    }),
    shareReplay({ refCount: true, bufferSize: 1 }),
  );

  constructor(
    private snackbar: MatSnackBar,
    private movieQuery: MovieQuery,
    private orgService: OrganizationService,
    private shell: MarketplaceMovieAvailsComponent,
    private router: Router,
    private route: ActivatedRoute
  ) { }

  clear() {
    this.availsForm.reset();
  }

  async selected(marker: DurationMarker) {
    const duration = { from: marker.from, to: marker.to };
    const avails = { ...this.availsForm.value, duration };

    const result = this.shell.bucketForm.getTermIndexForCalendar(avails, marker);
    if (result) {
      const { contractIndex, termIndex } = result;
      const contract = this.shell.bucketForm.get('contracts').at(contractIndex);
      const term = contract.get('terms').at(termIndex);
      term.setValue({ ...term.value, ...avails });
    } else {
      this.shell.bucketForm.addDuration(avails, marker);
    }

    this.snackbar.open(`Rights ${result ? 'updated' : 'added'}`, 'Show ⇩', { duration: 5000 })
      .onAction()
      .subscribe(() => {
        scrollIntoView(document.querySelector('#rights'));
      });
  }

  ngAfterViewInit() {
    const decodedData = decodeUrl(this.route);
    this.availsForm.patchValue(decodedData)
    const subSearchUrl = this.availsForm.valueChanges.pipe(
      throttleTime(1000)
    ).subscribe(formState => {
      encodeUrl<AvailsFilter>(
        this.router, this.route, formState
      );
    });
    this.subs.push(subSearchUrl);
  }

  ngOnDestroy() {
    this.subs.forEach(s => s.unsubscribe())
  }
}
