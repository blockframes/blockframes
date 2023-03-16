import { AfterViewInit, ChangeDetectionStrategy, Component, OnDestroy, Optional } from '@angular/core';
import { combineLatest, firstValueFrom, Subscription } from 'rxjs';
import { debounceTime, map, shareReplay } from 'rxjs/operators';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { scrollIntoView } from '@blockframes/utils/browser/utils';
import { decodeUrl, encodeUrl } from '@blockframes/utils/form/form-state-url-encoder';
import { MarketplaceMovieAvailsComponent } from '../avails.component';
import {
  filterContractsByTitle,
  TerritoryValue,
  AvailableTerritoryMarker,
  BucketTerritoryMarker,
  emptyAvailabilities,
  MapAvailsFilter,
  territoryAvailabilities,
  decodeDate,
} from '@blockframes/model';
import { AnalyticsService } from '@blockframes/analytics/service';
import { MovieService } from '@blockframes/movie/service';
import { Intercom } from 'ng-intercom';

@Component({
  selector: 'catalog-movie-avails-map',
  templateUrl: './avails-map.component.html',
  styleUrls: ['./avails-map.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MarketplaceMovieAvailsMapComponent implements AfterViewInit, OnDestroy {
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

  private sub: Subscription;

  private titleId: string = this.route.snapshot.params.movieId;

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
    private route: ActivatedRoute,
    private analyticsService: AnalyticsService,
    private movieService: MovieService,
    @Optional() private intercom: Intercom
  ) { }

  /** Display the territories information in the tooltip */
  public displayTerritoryTooltip(territory: TerritoryValue, status: string) {
    this.hoveredTerritory = { name: territory, status };
  }

  /** Clear the territories information */
  public clearTerritoryTooltip() {
    this.hoveredTerritory = null;
  }

  public async addTerritory(territory: AvailableTerritoryMarker) {
    const { available } = await firstValueFrom(this.availabilities$);
    let added = false;
    for (const marker of available.filter(marker => marker.slug === territory.slug)) {
      const avails: MapAvailsFilter = {
        ...this.availsForm.value,
        medias: this.availsForm.value.medias.filter(m => marker.term.medias.includes(m))
      };
      const alreadyInBucket = this.shell.bucketForm.isAlreadyInBucket(avails, marker);
      if (!alreadyInBucket) {
        const result = this.shell.bucketForm.addTerritory(avails, marker);
        if (result) added = true;
      }
    };
    if (added) this.onNewRight();
  }

  public removeTerritory(territory: BucketTerritoryMarker) {
    this.shell.bucketForm.removeTerritory(this.availsForm.value, territory);
  }

  public async selectAll() {
    if (this.availsForm.invalid) return;
    let added = false;
    const { available } = await firstValueFrom(this.availabilities$);
    for (const marker of available) {
      const avails: MapAvailsFilter = {
        ...this.availsForm.value,
        medias: this.availsForm.value.medias.filter(m => marker.term.medias.includes(m))
      };
      const alreadyInBucket = this.shell.bucketForm.isAlreadyInBucket(avails, marker);
      if (!alreadyInBucket) {
        const result = this.shell.bucketForm.addTerritory(avails, marker);
        if (result) added = true;
      }
    };
    if (added) this.onNewRight();
  }

  clear() {
    this.analyticsService.addTitleFilter({ avails: this.availsForm.value }, 'marketplace', 'filteredAvailsMap', true);
  }

  onNewRight() {
    this.snackbar
      .open('Terms added', 'SHOW ⇩', { duration: 5000 })
      .onAction()
      .subscribe(() => {
        scrollIntoView(document.querySelector('#rights'));
      });
  }

  async ngAfterViewInit() {
    const decodedData = decodeUrl<MapAvailsFilter>(this.route);
    this.load(decodedData);

    const movie = await this.movieService.getValue(this.titleId);
    this.sub = this.availsForm.valueChanges
      .pipe(debounceTime(1000))
      .subscribe(avails => {
        this.analyticsService.addTitleFilter({ avails, titleId: movie.id, ownerOrgIds: movie.orgIds }, 'marketplace', 'filteredAvailsMap');
        return encodeUrl<MapAvailsFilter>(this.router, this.route, avails);
      });
  }

  ngOnDestroy() {
    this.sub?.unsubscribe();
  }

  load(avails: MapAvailsFilter) {
    if (!avails.medias) avails.medias = [];
    if (avails.duration?.from) avails.duration.from = decodeDate(avails.duration.from);
    if (avails.duration?.to) avails.duration.to = decodeDate(avails.duration.to);

    this.availsForm.patchValue(avails);
    this.analyticsService.addTitleFilter({ avails: this.availsForm.value }, 'marketplace', 'filteredAvailsMap', true);
  }

  public openIntercom() {
    const isIntercomAvailable = document.getElementById('intercom-frame');
    if (isIntercomAvailable) return this.intercom.show();
    return this.router.navigate(['/c/o/marketplace/contact']);
  }
}
