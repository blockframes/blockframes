import { AfterViewInit, ChangeDetectionStrategy, Component, OnDestroy } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { availableTerritories, AvailsFilter, collidingTerms, toTerritoryMarker } from "@blockframes/contract/avails/avails";
import { decodeUrl, encodeUrl } from "@blockframes/utils/form/form-state-url-encoder";
import { downloadCsvFromJson } from "@blockframes/utils/helpers";
import { territoriesISOA3, TerritoryValue } from "@blockframes/utils/static-model";
import { combineLatest, Subscription } from "rxjs";
import { filter, first, map, shareReplay, startWith, throttleTime } from "rxjs/operators";
import { CatalogAvailsShellComponent } from "../shell/shell.component";
import { format } from 'date-fns';
import { medias } from '@blockframes/utils/static-model'

function formatDate(date: Date) {
  return format(date, 'dd/MM/yyy')
}


@Component({
  selector: 'catalog-dashboard-avails-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardAvailsMapComponent implements AfterViewInit, OnDestroy {
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
    const decodedData = decodeUrl<Partial<AvailsFilter>>(this.route);
    if (!decodedData.territories) decodedData.territories = []
    if (!decodedData.medias) decodedData.medias = []
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
      .subscribe(([territoryMarker, movie]) => {
        const availsFilter = this.availsForm.value;
        const availableTerritories = territoryMarker.flatMap(marker => marker.term.territories);
        const termTerritories = Array.from(new Set(availableTerritories))
        const data = [{
          "International Title": movie.title.international,
          Medias: availsFilter.medias.map(medium => medias[medium]).join(';'),
          Exclusivity: availsFilter.exclusive ? 'Exclusive' : 'Non Exclusive',
          'Start Date - End Date': `${formatDate(availsFilter.duration.from)} - ${formatDate(availsFilter.duration.to)}`,
          "Available Territories": termTerritories.map(territory => territories[territory]).join(';'),
        }]
        const filename = `${movie.title.international.split(' ').join('_')}_avails`;
        downloadCsvFromJson(data, filename);
      })
  }
}
