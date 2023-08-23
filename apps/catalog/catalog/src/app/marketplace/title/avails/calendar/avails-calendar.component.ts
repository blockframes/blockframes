import { AfterViewInit, ChangeDetectionStrategy, Component, OnDestroy, Optional } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { combineLatest, Subscription } from 'rxjs';
import { debounceTime, map, startWith } from 'rxjs/operators';
import { scrollIntoView } from '@blockframes/utils/browser/utils';
import { decodeUrl, encodeUrl } from '@blockframes/utils/form/form-state-url-encoder';
import { MarketplaceMovieAvailsComponent } from '../avails.component';
import {
  filterContractsByTitle,
  CalendarAvailsFilter,
  durationAvailabilities,
  DurationMarker,
  appName
} from '@blockframes/model';
import { AnalyticsService } from '@blockframes/analytics/service';
import { MovieService } from '@blockframes/movie/service';
import { Intercom } from 'ng-intercom';

@Component({
  selector: 'catalog-movie-avails-calendar',
  templateUrl: './avails-calendar.component.html',
  styleUrls: ['./avails-calendar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MarketplaceMovieAvailsCalendarComponent implements AfterViewInit, OnDestroy {
  public availsForm = this.shell.avails.calendarForm;

  public status$ = this.availsForm.statusChanges.pipe(startWith(this.availsForm.status));

  private sub: Subscription;

  public mandates$ = this.shell.mandates$;
  private mandateTerms$ = this.shell.mandateTerms$;

  private sales$ = this.shell.sales$;
  private salesTerms$ = this.shell.salesTerms$;

  private titleId: string = this.route.snapshot.params.movieId;

  public appName = appName.catalog;

  public availabilities$ = combineLatest([
    this.availsForm.value$,
    this.mandates$,
    this.mandateTerms$,
    this.sales$,
    this.salesTerms$,
    this.shell.bucketForm.value$,
    this.shell.movie$,
  ]).pipe(
    map(([avails, mandates, mandateTerms, sales, salesTerms, bucket, movie]) => {
      if (this.availsForm.invalid) return { available: [], sold: [], inBucket: [], selected: undefined };
      const res = filterContractsByTitle(
        movie.id,
        mandates,
        mandateTerms,
        sales,
        salesTerms,
        bucket
      );
      return durationAvailabilities(avails, res.mandates, res.sales, res.bucketContracts);
    }
    )
  );

  constructor(
    private snackbar: MatSnackBar,
    private shell: MarketplaceMovieAvailsComponent,
    private router: Router,
    private route: ActivatedRoute,
    private analyticsService: AnalyticsService,
    private movieService: MovieService,
    @Optional() private intercom: Intercom
  ) { }

  clear() {
    this.analyticsService.addTitleFilter({ avails: this.availsForm.value }, 'marketplace', 'filteredAvailsCalendar', true);
  }

  async selected(marker: DurationMarker) {
    const duration = { from: marker.from, to: marker.to };
    const avails = { ...marker.avail, duration };

    const result = this.shell.bucketForm.getTermIndexForCalendar(avails, marker);
    if (result) {
      const { contractIndex, termIndex } = result;
      const contract = this.shell.bucketForm.get('contracts').at(contractIndex);
      const term = contract.get('terms').at(termIndex);
      term.setValue({ ...term.value, ...avails });
    } else {
      this.shell.bucketForm.addDuration(avails, marker);
    }

    this.snackbar
      .open(`Terms  ${result ? 'updated' : 'added'}`, 'SHOW ⇩', { duration: 5000 })
      .onAction()
      .subscribe(() => {
        scrollIntoView(document.querySelector('#rights'));
      });
  }

  async ngAfterViewInit() {
    const decodedData = decodeUrl<CalendarAvailsFilter>(this.route);
    this.load(decodedData);

    const movie = await this.movieService.getValue(this.titleId);
    this.sub = this.availsForm.valueChanges
      .pipe(debounceTime(1000))
      .subscribe(avails => {
        this.analyticsService.addTitleFilter({ avails, titleId: movie.id, ownerOrgIds: movie.orgIds }, 'marketplace', 'filteredAvailsCalendar');
        return encodeUrl<CalendarAvailsFilter>(this.router, this.route, avails);
      });
  }

  ngOnDestroy() {
    this.sub?.unsubscribe();
  }

  load(avails: CalendarAvailsFilter) {
    if (!avails.medias) avails.medias = [];
    if (!avails.territories) avails.territories = [];

    this.availsForm.patchValue(avails);
    this.analyticsService.addTitleFilter({ avails: this.availsForm.value }, 'marketplace', 'filteredAvailsCalendar', true);
  }

  public openIntercom() {
    const isIntercomAvailable = document.getElementById('intercom-frame');
    if (isIntercomAvailable) return this.intercom.show();
    return this.router.navigate(['/c/o/marketplace/contact']);
  }
}
