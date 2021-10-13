import { AfterViewInit, ChangeDetectionStrategy, Component, OnDestroy } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { AvailsFilter, collidingTerms, DurationMarker, getDurationMarkers, toDurationMarker } from "@blockframes/contract/avails/avails";
import { decodeUrl, encodeUrl } from "@blockframes/utils/form/form-state-url-encoder";
import { downloadCsvFromJson } from "@blockframes/utils/helpers";
import { TerritoryValue } from "@blockframes/utils/static-model";
import { combineLatest, Subject, Subscription } from "rxjs";
import { filter, first, map, shareReplay, startWith, throttleTime } from "rxjs/operators";
import { CatalogAvailsShellComponent } from "../shell/shell.component";
import { format } from 'date-fns';
import { medias } from '@blockframes/utils/static-model'

function formatDate(date: Date) {
  return format(date, 'dd/MM/yyy')
}

function getDuration(durations: DurationMarker[]) {
  return durations.map(duration => `${formatDate(duration.from)} - ${formatDate(duration.to)}`);
}


@Component({
  selector: 'catalog-dashboard-calendar-map',
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardAvailsCalendarComponent implements AfterViewInit, OnDestroy {
  public hoveredTerritory: {
    name: string;
    status: string;
  }

  sub: Subscription;
  public availsForm = this.shell.avails.mapForm;

  public org$ = this.shell.movieOrg$;
  public status$ = this.availsForm.statusChanges.pipe(startWith(this.availsForm.valid ? 'VALID' : 'INVALID'));
  private mandates$ = this.shell.mandates$;
  private mandateTerms$ = this.shell.mandateTerms$;
  private salesTerms$ = this.shell.salesTerms$;

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

  private hasTerritories$ = this.available$.pipe(
    map(territoryMarker => territoryMarker.some(marker => marker.term.territories.length > 0)),
  );

  disableCsv$ = combineLatest([
    this.availsForm.statusChanges.pipe(map(() => this.availsForm.invalid)),
    this.hasTerritories$,
  ]).pipe(
    map(([formInvalid, hasTerritories]) => formInvalid || !hasTerritories),
    startWith(true),
  )


  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private shell: CatalogAvailsShellComponent,
  ) { }

  ngAfterViewInit() {
    const decodedData = decodeUrl(this.route);
    this.availsForm.patchValue(decodedData);
    this.sub = this.availsForm.valueChanges.pipe(
      throttleTime(1000)
    ).subscribe(formState => {
      encodeUrl<AvailsFilter>(this.router, this.route, formState);
    });
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }

  /** Display the territories information in the tooltip */
  public displayTerritoryTooltip(territory: TerritoryValue, status: string) {
    this.hoveredTerritory = { name: territory, status }
  }

  /** Clear the territories information */
  public clearTerritoryTooltip() {
    this.hoveredTerritory = null;
  }

  clear() {
    this.shell.avails.mapForm.reset();
  }


  downloadCsv() {
    combineLatest([
      this.available$,
      this.shell.movie$
    ]).pipe(first())
      .subscribe(([durationMarkers, movie]) => {
        console.log({ durationMarker: durationMarkers })
        const availsFilter = this.availsForm.value;
        const territories = availsFilter.territories;
        const data = [{
          "International Title": movie.title.international,
          Medias: availsFilter.medias.map(medium => medias[medium]).join(';'),
          Exclusivity: availsFilter.exclusive ? 'Exclusive' : 'Non Exclusive',
          'Start Date - End Date': getDuration(durationMarkers).join(';'),
          "Available Territories": territories.map(territory => territories[territory]).join(';'),
        }]
        const filename = `${movie.title.international.split(' ').join('_')}_avails`;
        downloadCsvFromJson(data, filename);
      })
  }
}
