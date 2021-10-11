import { AfterViewInit, ChangeDetectionStrategy, Component, OnDestroy } from "@angular/core";
import { MatSnackBar } from "@angular/material/snack-bar";
import { ActivatedRoute, Router } from "@angular/router";
import { availableTerritories, AvailsFilter, collidingTerms, getTerritoryMarkers, toTerritoryMarker } from "@blockframes/contract/avails/avails";
import { decodeUrl, encodeUrl } from "@blockframes/utils/form/form-state-url-encoder";
import { downloadCsvFromJson } from "@blockframes/utils/helpers";
import { territoriesISOA3, TerritoryValue } from "@blockframes/utils/static-model";
import { combineLatest, Subscription } from "rxjs";
import { filter, first, map, shareReplay, startWith, throttleTime } from "rxjs/operators";
import { CatalogAvailsShellComponent } from "../shell/shell.component";
import { format } from 'date-fns';
import { medias, territories } from '@blockframes/utils/static-model'

@Component({
  selector: 'catalog-dashboard-avails-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CatalogDashboardAvailsMapComponent implements AfterViewInit, OnDestroy {
  public hoveredTerritory: {
    name: string;
    status: string;
  }

  sub: Subscription;
  public availsForm = this.shell.avails.mapForm;
  private availsFormValues$ = this.availsForm.valueChanges.pipe(
    shareReplay({ refCount: true, bufferSize: 1 }),
  )


  public org$ = this.shell.movieOrg$;
  public status$ = this.availsForm.statusChanges.pipe(startWith(this.availsForm.valid ? 'VALID' : 'INVALID'));
  private mandates$ = this.shell.mandates$;
  private mandateTerms$ = this.shell.mandateTerms$;
  private salesTerms$ = this.shell.salesTerms$;

  /** All mandates markers by territory (they might be already sold or already selected selected (from the bucket) or already in selection) */
  private territoryMarkers$ = combineLatest([
    this.mandates$,
    this.mandateTerms$,
  ]).pipe(
    map(([mandates, mandateTerms]) => getTerritoryMarkers(mandates, mandateTerms)),
  );

  public sold$ = combineLatest([
    this.salesTerms$,
    this.availsForm.value$,
  ]).pipe(
    filter(() => this.availsForm.valid),
    map(([salesTerms, avails]) => {
      const soldTerms = collidingTerms(avails, salesTerms);
      const markers = soldTerms.map(term => term.territories
        .filter(territory => !!territoriesISOA3[territory])
        .map(territory => toTerritoryMarker(territory, [], term))
      ).flat();
      return markers;
    }),
  );

  public available$ = combineLatest([
    this.mandates$,
    this.sold$,
    this.mandateTerms$
  ]).pipe(
    map(([mandates, sold, mandateTerms,]) => {
      if (this.availsForm.invalid) return [];
      return availableTerritories([], sold, [], this.availsForm.value, mandates, mandateTerms);
    }),
    shareReplay({ refCount: true, bufferSize: 1 }),
  );


  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private shell: CatalogAvailsShellComponent,
    private snackbar: MatSnackBar,
  ) { }

  ngAfterViewInit() {
    const decodedData = decodeUrl(this.route);
    this.availsForm.patchValue(decodedData);
    const subSearchUrl = this.availsForm.valueChanges.pipe(
      throttleTime(1000)
    ).subscribe(formState => {
      encodeUrl<AvailsFilter>(this.router, this.route, formState);
    });
    this.sub = subSearchUrl;
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

  formatDate(date: Date) {
    return format(date, 'dd/MM/yyy')
  }

  downloadCsv() {
    combineLatest(
      this.available$.pipe(first()),
      this.shell.movie$.pipe(first())
    )
      .subscribe(([territoryMarker, movie]) => {
        const availsFilter = this.availsForm.value;
        const territoriesMap = territoryMarker.flatMap(marker => marker.term.territories);
        const termTerritories = Array.from(new Set(territoriesMap))
        console.log({ territories: termTerritories })
        const data = [{
          "International Title": movie.title.international,
          Medias: availsFilter.medias.map(medium => medias[medium]).join(';'),
          Exclusivity: availsFilter.exclusive ? 'Exclusive' : 'Non Exclusive',
          'Start Date - End Date': `${this.formatDate(availsFilter.duration.from)} - ${this.formatDate(availsFilter.duration.to)}`,
          "Available Territories": termTerritories.map(territory => territories[territory]).join(';'),
        }]
        downloadCsvFromJson(data, 'my-avails');
      })
  }
}
