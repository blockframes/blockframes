
import { AfterViewInit, ChangeDetectionStrategy, Component } from '@angular/core';

import { combineLatest } from 'rxjs';
import { filter, map, pluck, shareReplay, startWith, take, throttleTime } from 'rxjs/operators';

import { MatSnackBar } from '@angular/material/snack-bar';

import {
  getSoldTerms,
  getSelectedTerritories,
  TerritoryMarker,
  toTerritoryMarker,
  getTerritoryMarkers,
  availableTerritories,
  AvailsFilter,
} from '@blockframes/contract/avails/avails';
import { territoriesISOA3, TerritoryValue } from '@blockframes/utils/static-model';

import { MarketplaceMovieAvailsComponent } from '../avails.component';
import { ActivatedRoute, Router } from '@angular/router';
import { decodeUrl, encodeUrl } from '@blockframes/utils/form/form-state-url-encoder';
import { scrollIntoView } from '@blockframes/utils/browser/utils';

@Component({
  selector: 'catalog-movie-avails-map',
  templateUrl: './avails-map.component.html',
  styleUrls: ['./avails-map.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MarketplaceMovieAvailsMapComponent implements AfterViewInit {
  public hoveredTerritory: {
    name: string;
    status: string;
  }

  public org$ = this.shell.movieOrg$;
  public availsForm = this.shell.avails.mapForm;
  public status$ = this.availsForm.statusChanges.pipe(startWith(this.availsForm.valid ? 'VALID' : 'INVALID'));
  private mandates$ = this.shell.mandates$;
  private mandateTerms$ = this.shell.mandateTerms$;
  private salesTerms$ = this.shell.salesTerms$;

  public territoryMarkers$ = combineLatest([
    this.mandates$,
    this.mandateTerms$,
  ]).pipe(
    map(([mandates, mandateTerms]) => getTerritoryMarkers(mandates, mandateTerms)),
  );

  public selected$ = combineLatest([
    this.availsForm.value$,
    this.shell.bucketForm.value$,
    this.territoryMarkers$,
    this.route.params.pipe(pluck('movieId'))
  ]).pipe(
    map(([avail, bucket, markers, movieId]) => getSelectedTerritories(movieId, avail, bucket, 'exact').map(t => markers[t])),
    startWith([]),
  );

  public inSelection$ = combineLatest([
    this.availsForm.value$,
    this.shell.bucketForm.value$,
    this.territoryMarkers$,
    this.route.params.pipe(pluck('movieId'))
  ]).pipe(
    map(([avail, bucket, markers, movieId]) => getSelectedTerritories(movieId, avail, bucket, 'in').map(t => markers[t])),
    startWith([]),
  );

  public sold$ = combineLatest([
    this.mandates$,
    this.salesTerms$,
    this.availsForm.value$,
  ]).pipe(
    filter(() => this.availsForm.valid),
    map(([mandates, sales, avails]) => {
      const soldTerms = getSoldTerms(avails, sales);
      return soldTerms.map(term => term.territories
        .filter(territory => !!territoriesISOA3[territory])
        .map(territory => toTerritoryMarker(territory, mandates, term))
      ).flat();
    }),
  );

  public available$ = combineLatest([
    this.mandates$,
    this.selected$,
    this.sold$,
    this.inSelection$,
    this.mandateTerms$
  ]).pipe(
    map(([mandates, selected, sold, inSelection, mandateTerms]) => {
      if (this.availsForm.invalid) return [];
      return availableTerritories(selected, sold, inSelection, this.availsForm.value, mandates, mandateTerms);
    }),
    shareReplay({ refCount: true, bufferSize: 1 }), // Multicast with replay
  );

  constructor(
    private snackbar: MatSnackBar,
    private shell: MarketplaceMovieAvailsComponent,
    private router: Router,
    private route: ActivatedRoute,
  ) { }

  /** Display the territories information in the tooltip */
  public displayTerritoryTooltip(territory: TerritoryValue, status: string) {
    this.hoveredTerritory = { name: territory, status }
  }

  /** Clear the territories information */
  public clearTerritoryTooltip() {
    this.hoveredTerritory = null;
  }

  public addTerritory(territory: TerritoryMarker) {
    const added = this.shell.bucketForm.addTerritory(this.availsForm.value, territory);
    if (added) this.onNewRight();
  }

  public removeTerritory(territory: TerritoryMarker) {
    this.shell.bucketForm.removeTerritory(this.availsForm.value, territory);
  }

  public async selectAll() {
    if (this.availsForm.invalid) return;
    const available = await this.available$.pipe(take(1)).toPromise();
    for (const term of available) {
      const alreadyInBucket = this.shell.bucketForm.isAlreadyInBucket(this.availsForm.value, term);
      if (!alreadyInBucket) {
        this.shell.bucketForm.addTerritory(this.availsForm.value, term);
      }
    }
    this.onNewRight();
  }

  clear() {
    this.shell.avails.mapForm.reset();
  }

  onNewRight() {
    this.snackbar.open(`Rights added`, 'Show ⇩', { duration: 5000 })
      .onAction()
      .subscribe(() => {
        scrollIntoView(document.querySelector('#rights'));
      });
  }

  ngAfterViewInit() {
    const decodedData = decodeUrl(this.route);
    this.availsForm.patchValue(decodedData);
    this.availsForm.valueChanges.pipe(
      throttleTime(1000)
    ).subscribe(formState => {
      encodeUrl<AvailsFilter>(
        this.router, this.route, formState
      );
    });
  }
}
