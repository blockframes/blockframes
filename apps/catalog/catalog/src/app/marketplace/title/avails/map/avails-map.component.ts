
import { ChangeDetectionStrategy, Component, OnDestroy } from '@angular/core';

import { combineLatest, ReplaySubject, Subscription } from 'rxjs';
import { filter, map, shareReplay, startWith, take } from 'rxjs/operators';

import { territoriesISOA3, TerritoryValue } from '@blockframes/utils/static-model';
import { availableTerritories, getSoldTerms, getTerritories, TerritoryMarker, toTerritoryMarker } from '@blockframes/contract/avails/avails';

import { MarketplaceMovieAvailsComponent } from '../avails.component';


@Component({
  selector: 'catalog-movie-avails-map',
  templateUrl: './avails-map.component.html',
  styleUrls: ['./avails-map.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MarketplaceMovieAvailsMapComponent implements OnDestroy {

  public hoveredTerritory: {
    name: string;
    status: string;
  }
  public territoryMarkers$ = new ReplaySubject<Record<string, TerritoryMarker>>();

  public org$ = this.shell.movieOrg$;
  public availsForm = this.shell.avails.mapForm;
  private mandates$ = this.shell.mandates$;
  private mandateTerms$ = this.shell.mandateTerms$;
  private salesTerms$ = this.shell.salesTerms$;

  private sub: Subscription;

  public selected$ = combineLatest([
    this.availsForm.value$,
    this.shell.bucketForm.value$,
    this.territoryMarkers$
  ]).pipe(
    map(([avail, bucket, markers]) => getTerritories(avail, bucket, 'exact').map(t => markers[t])),
    startWith([]),
  );

  public inSelection$ = combineLatest([
    this.availsForm.value$,
    this.shell.bucketForm.value$,
    this.territoryMarkers$
  ]).pipe(
    map(([avail, bucket, markers]) => getTerritories(avail, bucket, 'in').map(t => markers[t])),
    startWith([]),
  );

  public sold$ = combineLatest([
    this.mandates$,
    this.salesTerms$,
    this.availsForm.value$
  ]).pipe(
    filter(() => this.availsForm.valid),
    map(([mandates, sales, avails]) => {
      const soldTerms = getSoldTerms(avails, sales);
      return soldTerms.map(term => term.territories
        .filter(territory => !!territoriesISOA3[territory])
        .map(territory => toTerritoryMarker(territory, mandates, term))
      ).flat();
    })
  )

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
    shareReplay(1) // Multicast with replay
  );

  constructor(
    private shell: MarketplaceMovieAvailsComponent,
  ) {
    this.sub =  combineLatest([
      this.mandates$,
      this.mandateTerms$,
    ]).subscribe(([mandates, mandateTerms]) => {
      const markers: Record<string, TerritoryMarker> = {};
      for (const term of mandateTerms) {
        for (const territory of term.territories) {
          if (territory in territoriesISOA3) {
            markers[territory] = toTerritoryMarker(territory, mandates, term);
          }
        }
      }

      this.territoryMarkers$.next(markers);
    });
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }

  public trackByTag<T>(tag: T) {
    return tag;
  }

  /** Display the territories information in the tooltip */
  public displayTerritoryTooltip(territory: TerritoryValue, status: string) {
    this.hoveredTerritory = { name: territory, status }
  }

  /** Clear the territories information */
  public clearTerritoryTooltip() {
    this.hoveredTerritory = null;
  }

  public addTerritory(territory: TerritoryMarker) {
    this.shell.bucketForm.addTerritory(this.availsForm.value, territory);
  }

  public removeTerritory(territory: TerritoryMarker) {
    this.shell.bucketForm.removeTerritory(this.availsForm.value, territory);
  }

  public async selectAll() {
    const available = await this.available$.pipe(take(1)).toPromise();
    for (const term of available) {
      const alreadyInBucket = this.shell.bucketForm.isAlreadyInBucket(this.availsForm.value, term);
      if (!alreadyInBucket) {
        this.shell.bucketForm.addTerritory(this.availsForm.value, term);
      }
    }
  }

  clear() {
    this.shell.avails.mapForm.reset();
  }
}
