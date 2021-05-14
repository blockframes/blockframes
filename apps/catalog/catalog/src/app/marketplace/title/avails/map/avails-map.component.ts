
import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';

import { filter, map, shareReplay, startWith, take } from 'rxjs/operators';
import { combineLatest, ReplaySubject } from 'rxjs';

import { Movie, MovieQuery } from '@blockframes/movie/+state';
import { Term, TermService } from '@blockframes/contract/term/+state';
import { territoriesISOA3, TerritoryValue } from '@blockframes/utils/static-model';
import { OrganizationService } from '@blockframes/organization/+state';
import { ContractService, isMandate, isSale, Mandate, Sale } from '@blockframes/contract/contract/+state';
import { availableTerritories, getSoldTerms, getTerritories, TerritoryMarker, toTerritoryMarker } from '@blockframes/contract/avails/avails';

import { MarketplaceMovieAvailsComponent } from '../avails.component';


@Component({
  selector: 'catalog-movie-avails-map',
  templateUrl: './avails-map.component.html',
  styleUrls: ['./avails-map.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MarketplaceMovieAvailsMapComponent implements OnInit {

  private mandates: Mandate[];
  private mandateTerms$ = new ReplaySubject<Term<Date>[]>();
  private sales: Sale[];
  private salesTerms$ = new ReplaySubject<Term<Date>[]>();

  public movie: Movie = this.movieQuery.getActive();

  public org$ = this.orgService.valueChanges(this.movie.orgIds[0]);

  public hoveredTerritory: {
    name: string;
    status: string;
  }
  public territoryMarkers$ = new ReplaySubject<Record<string, TerritoryMarker>>();

  public availsForm = this.shell.avails.mapForm;

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
    this.salesTerms$,
    this.availsForm.value$
  ]).pipe(
    filter(() => this.availsForm.valid),
    map(([sales, avails]) => {
      const soldTerms = getSoldTerms(avails, sales);
      return soldTerms.map(term => term.territories
        .filter(territory => !!territoriesISOA3[territory])
        .map(territory => toTerritoryMarker(territory, this.mandates, term))
      ).flat();
    })
  )

  public available$ = combineLatest([
    this.selected$,
    this.sold$,
    this.inSelection$,
    this.mandateTerms$
  ]).pipe(
    map(([selected, sold, inSelection, mandates]) => {
      if (this.availsForm.invalid) return [];
      return availableTerritories(selected, sold, inSelection, this.availsForm.value, this.mandates, mandates);
    }),
    shareReplay(1) // Multicast with replay
  );

  constructor(
    private movieQuery: MovieQuery,
    private termService: TermService,
    private orgService: OrganizationService,
    private contractService: ContractService,
    private shell: MarketplaceMovieAvailsComponent,
  ) { }

  public async ngOnInit() {
    const contracts = await this.contractService.getValue(ref => ref.where('titleId', '==', this.movie.id).where('status', '==', 'accepted'));

    this.mandates = contracts.filter(isMandate);
    this.sales = contracts.filter(isSale);

    const [mandateTerms, salesTerms] = await Promise.all([
      this.termService.getValue(this.mandates.map(mandate => mandate.termIds).flat()),
      this.termService.getValue(this.sales.map(sale => sale.termIds).flat())
    ]);

    const markers: Record<string, TerritoryMarker> = {};
    for (const term of mandateTerms) {
      for (const territory of term.territories) {
        if (territory in territoriesISOA3) {
          markers[territory] = toTerritoryMarker(territory, this.mandates, term);
        }
      }
    }

    this.territoryMarkers$.next(markers);
    this.mandateTerms$.next(mandateTerms);
    this.salesTerms$.next(salesTerms);
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
