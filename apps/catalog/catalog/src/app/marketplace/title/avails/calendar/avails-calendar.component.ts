
import { AfterViewInit, ChangeDetectionStrategy, Component, OnDestroy } from '@angular/core';

import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';

import { combineLatest, Subscription } from 'rxjs';
import { map, startWith, throttleTime } from 'rxjs/operators';

import { MovieQuery } from '@blockframes/movie/+state';
import { scrollIntoView } from '@blockframes/utils/browser/utils';
import { OrganizationService } from '@blockframes/organization/+state';
import { decodeUrl, encodeUrl } from '@blockframes/utils/form/form-state-url-encoder';
import { CalendarAvailsFilter, durationAvailabilities, DurationMarker, filterContractsByTitle } from '@blockframes/contract/avails/avails';

import { MarketplaceMovieAvailsComponent } from '../avails.component';


@Component({
  selector: 'catalog-movie-avails-calendar',
  templateUrl: './avails-calendar.component.html',
  styleUrls: ['./avails-calendar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MarketplaceMovieAvailsCalendarComponent implements AfterViewInit, OnDestroy {

  public titleId = this.shell.movie.id;

  public availsForm = this.shell.avails.calendarForm;

  public org$ = this.orgService.valueChanges(this.movieQuery.getActive().orgIds[0]);

  public status$ = this.availsForm.statusChanges.pipe(startWith(this.availsForm.status));

  private subs: Subscription[] = [];

  public mandates$ = this.shell.mandates$;
  private mandateTerms$ = this.shell.mandateTerms$;

  private sales$ = this.shell.sales$;
  private salesTerms$ = this.shell.salesTerms$;

  public availabilities$ = combineLatest([
    this.availsForm.valueChanges,
    this.mandates$,
    this.mandateTerms$,
    this.sales$,
    this.salesTerms$,
    this.shell.bucketForm.value$,
  ]).pipe(
    map(([avails, mandates, mandateTerms, sales, salesTerms, bucket]) => {
      if (this.availsForm.invalid) return { available: [], sold: [], inBucket: [], selected: undefined };
      const res = filterContractsByTitle(this.titleId, mandates, mandateTerms, sales, salesTerms, bucket)
      return durationAvailabilities(avails, res.mandates, res.sales, res.bucketContracts);
    }),
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

    this.availsForm.patchValue(decodedData);
    const subSearchUrl = this.availsForm.valueChanges.pipe(
      throttleTime(1000)
    ).subscribe(formState => {
      encodeUrl<CalendarAvailsFilter>(
        this.router, this.route, formState
      );
    });
    this.subs.push(subSearchUrl);
  }

  ngOnDestroy() {
    this.subs.forEach(s => s.unsubscribe())
  }
}
