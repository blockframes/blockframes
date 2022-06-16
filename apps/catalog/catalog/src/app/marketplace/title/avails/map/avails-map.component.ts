import { AfterViewInit, ChangeDetectionStrategy, Component } from '@angular/core';
import { combineLatest, firstValueFrom } from 'rxjs';
import { map, shareReplay, throttleTime } from 'rxjs/operators';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { scrollIntoView } from '@blockframes/utils/browser/utils';
import { decodeDate, decodeUrl, encodeUrl } from '@blockframes/utils/form/form-state-url-encoder';
import {
  AvailableTerritoryMarker,
  BucketTerritoryMarker,
  emptyAvailabilities,
  filterContractsByTitle,
  MapAvailsFilter,
  territoryAvailabilities,
} from '@blockframes/contract/avails/avails';
import { MarketplaceMovieAvailsComponent } from '../avails.component';
import { TerritoryValue } from '@blockframes/model';

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
  };

  public org$ = this.shell.movieOrg$;
  public availsForm = this.shell.avails.mapForm;
  public mandates$ = this.shell.mandates$;
  private mandateTerms$ = this.shell.mandateTerms$;
  private sales$ = this.shell.sales$;
  private salesTerms$ = this.shell.salesTerms$;

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
      if (this.availsForm.invalid) return emptyAvailabilities;
      const res = filterContractsByTitle(
        movie.id,
        mandates,
        mandateTerms,
        sales,
        salesTerms,
        bucket
      );
      const data = {
        avails,
        mandates: res.mandates,
        sales: res.sales,
        bucketContracts: res.bucketContracts,
      };
      return territoryAvailabilities(data);
    }
    ),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  constructor(
    private snackbar: MatSnackBar,
    private shell: MarketplaceMovieAvailsComponent,
    private router: Router,
    private route: ActivatedRoute
  ) { }

  /** Display the territories information in the tooltip */
  public displayTerritoryTooltip(territory: TerritoryValue, status: string) {
    this.hoveredTerritory = { name: territory, status };
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
    const { available } = await firstValueFrom(this.availabilities$);
    for (const marker of available) {
      const alreadyInBucket = this.shell.bucketForm.isAlreadyInBucket(
        this.availsForm.value,
        marker
      );
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
    this.snackbar
      .open('Terms added', 'SHOW ⇩', { duration: 5000 })
      .onAction()
      .subscribe(() => {
        scrollIntoView(document.querySelector('#rights'));
      });
  }

  ngAfterViewInit() {
    const decodedData = decodeUrl<MapAvailsFilter>(this.route);
    if (!decodedData.medias) decodedData.medias = [];
    if (decodedData.duration?.from) decodedData.duration.from = decodeDate(decodedData.duration.from);
    if (decodedData.duration?.to) decodedData.duration.to = decodeDate(decodedData.duration.to);

    this.availsForm.patchValue(decodedData);
    this.availsForm.valueChanges.pipe(throttleTime(1000)).subscribe((formState) => {
      encodeUrl<MapAvailsFilter>(this.router, this.route, formState);
    });
  }
}
