import { AfterViewInit, ChangeDetectionStrategy, Component, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { format } from 'date-fns';
import { combineLatest, Subscription } from 'rxjs';
import { first, map, shareReplay, startWith, throttleTime } from 'rxjs/operators';
import { filterContractsByTitle, medias, TerritoryValue, MapAvailsFilter, territoryAvailabilities, decodeDate, toGroupLabel } from '@blockframes/model';
import { downloadCsvFromJson } from '@blockframes/utils/helpers';
import { decodeUrl, encodeUrl } from '@blockframes/utils/form/form-state-url-encoder';
import { CatalogAvailsShellComponent } from '../shell/shell.component';

function formatDate(date: Date) {
  return format(date, 'dd/MM/yyy');
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

  public status$ = this.availsForm.statusChanges.pipe(startWith(this.availsForm.valid ? 'VALID' : 'INVALID'));

  public availabilities$ = combineLatest([
    this.shell.movie$,
    this.availsForm.value$,
    this.shell.mandates$,
    this.shell.mandateTerms$,
    this.shell.sales$,
    this.shell.salesTerms$,
  ]).pipe(
    map(([movie, avails, mandates, mandateTerms, sales, salesTerms]) => {
      if (this.availsForm.invalid) return { available: [], sold: [] };
      const res = filterContractsByTitle(movie.id, mandates, mandateTerms, sales, salesTerms);
      const data = { avails, mandates: res.mandates, sales: res.sales };
      return territoryAvailabilities(data);
    }),
    shareReplay({ bufferSize: 1, refCount: true }),
  );

  private hasTerritories$ = this.availabilities$.pipe(
    map(availabilities => availabilities.available.length > 0),
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
    const decodedData = decodeUrl<Partial<MapAvailsFilter>>(this.route);
    if (!decodedData.medias) decodedData.medias = [];
    if (decodedData.duration?.from) decodedData.duration.from = decodeDate(decodedData.duration.from);
    if (decodedData.duration?.to) decodedData.duration.to = decodeDate(decodedData.duration.to);

    this.availsForm.patchValue(decodedData);
    this.sub = this.availsForm.valueChanges.pipe(
      throttleTime(1000)
    ).subscribe(formState => {
      encodeUrl<MapAvailsFilter>(this.router, this.route, formState);
    });
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }

  /** Display the territories information in the tooltip */
  public displayTerritoryTooltip(territory: TerritoryValue, status: string) {
    this.hoveredTerritory = { name: territory, status };
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
      this.availabilities$,
      this.shell.movie$
    ]).pipe(first())
      .subscribe(([availabilities, movie]) => {
        const availsFilter = this.availsForm.value;
        const availableTerritories = availabilities.available.map(marker => marker.term.territories).flat();
        const territories = toGroupLabel(availableTerritories, 'territories', 'World');
        const data = [{
          'International Title': movie.title.international,
          Medias: availsFilter.medias.map(medium => medias[medium]).join(';'),
          Exclusivity: availsFilter.exclusive ? 'Exclusive' : 'Non Exclusive',
          'Start Date - End Date': `${formatDate(availsFilter.duration.from)} - ${formatDate(availsFilter.duration.to)}`,
          'Available Territories': territories,
        }]
        const filename = `${movie.title.international.split(' ').join('_')}_avails`;
        downloadCsvFromJson(data, filename);
      })
  }
}
