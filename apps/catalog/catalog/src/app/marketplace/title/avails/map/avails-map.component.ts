
import { AfterViewInit, ChangeDetectionStrategy, Component } from '@angular/core';

import { combineLatest } from 'rxjs';
import { map, startWith, take, throttleTime } from 'rxjs/operators';

import { MatSnackBar } from '@angular/material/snack-bar';

import { TerritoryValue } from '@blockframes/utils/static-model';

import { MarketplaceMovieAvailsComponent } from '../avails.component';
import { ActivatedRoute, Router } from '@angular/router';
import { decodeUrl, encodeUrl } from '@blockframes/utils/form/form-state-url-encoder';
import { scrollIntoView } from '@blockframes/utils/browser/utils';
import { AvailableTerritoryMarker, BucketTerritoryMarker, filterByTitle, MapAvailsFilter, territoryAvailabilities } from '@blockframes/contract/avails/new-avails';

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

  public titleId = this.shell.movie.id;
  public org$ = this.shell.movieOrg$;
  public availsForm = this.shell.avails.mapForm;
  public status$ = this.availsForm.statusChanges.pipe(startWith(this.availsForm.valid ? 'VALID' : 'INVALID'));
  private mandates$ = this.shell.mandates$;
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
      if (this.availsForm.invalid) return { notLicensed: [], available: [], sold: [], inBucket: [], selected: [] };
      const res = filterByTitle(this.titleId, mandates, mandateTerms, sales, salesTerms, bucket)
      return territoryAvailabilities(avails, res.mandates, res.sales, res.bucketContracts);
    }),
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

  public addTerritory(territory: AvailableTerritoryMarker) {
    const added = this.shell.bucketForm.addTerritory(this.availsForm.value, territory);
    if (added) this.onNewRight();
  }

  public removeTerritory(territory: BucketTerritoryMarker) {
    this.shell.bucketForm.removeTerritory(this.availsForm.value, territory);
  }

  public async selectAll() {
    if (this.availsForm.invalid) return;
    const available = await this.availabilities$.pipe(take(1)).toPromise().then(a => a.available);
    for (const marker of available) {
      const alreadyInBucket = this.shell.bucketForm.isAlreadyInBucket(this.availsForm.value, marker);
      if (!alreadyInBucket) {
        this.shell.bucketForm.addTerritory(this.availsForm.value, marker);
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
    if (decodedData.duration?.from) decodedData.duration.from = new Date(decodedData.duration.from);
    if (decodedData.duration?.to) decodedData.duration.to = new Date(decodedData.duration.to);

    this.availsForm.patchValue(decodedData);
    this.availsForm.valueChanges.pipe(
      throttleTime(1000)
    ).subscribe(formState => {
      encodeUrl<MapAvailsFilter>(
        this.router, this.route, formState
      );
    });
  }
}
