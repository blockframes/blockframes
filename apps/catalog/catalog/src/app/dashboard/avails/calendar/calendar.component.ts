import { AfterViewInit, ChangeDetectionStrategy, Component, OnDestroy } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { format } from 'date-fns';
import { combineLatest, Subscription } from "rxjs";
import { first, map, shareReplay, startWith, throttleTime } from "rxjs/operators";
import { medias } from '@blockframes/utils/static-model'
import { downloadCsvFromJson } from "@blockframes/utils/helpers";
import { decodeUrl, encodeUrl } from "@blockframes/utils/form/form-state-url-encoder";
import { DurationMarker, CalendarAvailsFilter, durationAvailabilities, filterContractsByTitle } from "@blockframes/contract/avails/avails";
import { CatalogAvailsShellComponent } from "../shell/shell.component";
import { toGroupLabel } from "@blockframes/utils/pipes/group-label.pipe";

function formatDate(date: Date) {
  return format(date, 'dd/MM/yyy')
}

function getDuration(durations: DurationMarker[]) {
  return durations.map(duration => `${formatDate(duration.from)} - ${formatDate(duration.to)}`);
}


@Component({
  selector: 'catalog-dashboard-avails-calendar',
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardAvailsCalendarComponent implements AfterViewInit, OnDestroy {
  private sub: Subscription;
  public availsForm = this.shell.avails.calendarForm;

  public status$ = this.availsForm.statusChanges.pipe(startWith(this.availsForm.valid ? 'VALID' : 'INVALID'));
  private movie$ = this.shell.movie$;
  private mandates$ = this.shell.mandates$;
  private mandateTerms$ = this.shell.mandateTerms$;
  private sales$ = this.shell.sales$;
  private salesTerms$ = this.shell.salesTerms$;

  public availabilities$ = combineLatest([
    this.movie$,
    this.availsForm.value$,
    this.mandates$,
    this.mandateTerms$,
    this.sales$,
    this.salesTerms$,
  ]).pipe(
    map(([movie, avails, mandates, mandateTerms, sales, salesTerms]) => {
      if (this.availsForm.invalid) return { available: [], sold: [] };
      const res = filterContractsByTitle(movie.id, mandates, mandateTerms, sales, salesTerms)
      return durationAvailabilities(avails, res.mandates, res.sales);
    }),
    shareReplay({ bufferSize: 1, refCount: true }),
  );

  private hasAvailableDuration$ = this.availabilities$.pipe(
    map(availabilities => availabilities.available.length),
  );

  disableCsv$ = combineLatest([
    this.availsForm.statusChanges.pipe(map(() => this.availsForm.invalid)),
    this.hasAvailableDuration$,
  ]).pipe(
    map(([formInvalid, hasAvailableDuration]) => formInvalid || !hasAvailableDuration),
    startWith(true),
  )


  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private shell: CatalogAvailsShellComponent,
  ) { }

  ngAfterViewInit() {
    const decodedData: any = decodeUrl(this.route);
    if (!decodedData.territories) decodedData.territories = []
    if (!decodedData.medias) decodedData.medias = []

    this.availsForm.patchValue(decodedData);
    this.sub = this.availsForm.valueChanges.pipe(
      throttleTime(1000)
    ).subscribe(formState => {
      encodeUrl<CalendarAvailsFilter>(this.router, this.route, formState);
    });
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }


  downloadCsv() {
    combineLatest([
      this.availabilities$,
      this.shell.movie$
    ]).pipe(first())
      .subscribe(([availabilities, movie]) => {
        const availsFilter = this.availsForm.value;
        const territories = toGroupLabel(availsFilter.territories, 'territories', 'World');
        const data = [{
          "International Title": movie.title.international,
          Medias: availsFilter.medias.map(medium => medias[medium]).join(';'),
          Exclusivity: availsFilter.exclusive ? 'Exclusive' : 'Non Exclusive',
          'Start Date - End Date': getDuration(availabilities.available).join(';'),
          "Available Territories": territories,
        }]
        const filename = `${movie.title.international.split(' ').join('_')}_avails`;
        downloadCsvFromJson(data, filename);
      })
  }
}
