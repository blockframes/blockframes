
import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';

import { map, shareReplay, startWith, take } from 'rxjs/operators';
import { BehaviorSubject, combineLatest } from 'rxjs';

import { Movie, MovieQuery } from '@blockframes/movie/+state';
import { Term, TermService } from '@blockframes/contract/term/+state';
import { territoriesISOA3, TerritoryValue } from '@blockframes/utils/static-model';
import { OrganizationService } from '@blockframes/organization/+state';
import { ContractService, isMandate, Mandate } from '@blockframes/contract/contract/+state';
import { availableTerritories, getTerritories, TerritoryMarker, toTerritoryMarker } from '@blockframes/contract/avails/avails';

import { MarketplaceMovieAvailsComponent } from '../avails.component';


@Component({
  selector: 'catalog-movie-avails-map',
  templateUrl: './avails-map.component.html',
  styleUrls: ['./avails-map.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MarketplaceMovieAvailsMapComponent implements OnInit {

  public movie: Movie = this.movieQuery.getActive();

  public org$ = this.orgService.valueChanges(this.movie.orgIds[0]);

  public hoveredTerritory: {
    name: string;
    status: string;
  }
  public territoryMarkers: { [key: string]: TerritoryMarker } = {};

  public availsForm = this.shell.avails.mapForm;

  public sold$ = new BehaviorSubject<TerritoryMarker[]>([]);

  public selected$ = combineLatest([
    this.availsForm.value$,
    this.shell.bucketForm.value$,
  ]).pipe(
    startWith([]),
    map(([avail]) => !!avail ? getTerritories(avail, this.shell.bucketForm.value, 'exact').map(t => this.territoryMarkers[t]) : []),
  );

  public inSelection$ = combineLatest([
    this.availsForm.value$,
    this.shell.bucketForm.value$,
  ]).pipe(
    startWith([]),
    map(([avail]) => !!avail ? getTerritories(avail, this.shell.bucketForm.value, 'in').map(t => this.territoryMarkers[t]) : []),
  );

  public available$ = combineLatest([
    this.selected$,
    this.sold$,
    this.inSelection$
  ]).pipe(
    map(([selected, sold, inSelection]) => {
      if (this.availsForm.invalid) return [];
      return availableTerritories(selected, sold, inSelection, this.availsForm.value, this.mandates, this.mandateTerms);
    }),
    shareReplay(1) // Multicast with replay
  );

  private mandates: Mandate[];
  private mandateTerms: Term<Date>[];

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
    this.mandateTerms = await this.termService.getValue(this.mandates.map(m => m.termIds).flat());

    for (const term of this.mandateTerms) {
      for (const territory of term.territories) {
        if (territory in territoriesISOA3) {
          this.territoryMarkers[territory] = toTerritoryMarker(territory, term.contractId, this.mandates, term);
        }
      }
    }
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
