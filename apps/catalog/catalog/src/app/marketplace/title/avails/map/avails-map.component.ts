
import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';

import { map, startWith } from 'rxjs/operators';
import { BehaviorSubject, combineLatest, Observable } from 'rxjs';

import { Movie, MovieQuery } from '@blockframes/movie/+state';
import { Term, TermService } from '@blockframes/contract/term/+state';
import { territoriesISOA3, TerritoryValue } from '@blockframes/utils/static-model';
import { Organization, OrganizationService } from '@blockframes/organization/+state';
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

  private mandates: Mandate[];
  private mandateTerms: Term<Date>[];

  public org$: Observable<Organization>;

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
  );


  constructor(
    private movieQuery: MovieQuery,
    private termService: TermService,
    private orgService: OrganizationService,
    private contractService: ContractService,
    private shell: MarketplaceMovieAvailsComponent,
  ) { }

  public async ngOnInit() {

    this.org$ = this.orgService.valueChanges(this.movie.orgIds[0]);

    const contracts = await this.contractService.getValue(ref => ref.where('titleId', '==', this.movie.id).where('status', '==', 'accepted'));

    this.mandates = contracts.filter(isMandate);
    this.mandateTerms = await this.termService.getValue(this.mandates.map(m => m.termIds).flat());

    for (const term of this.mandateTerms) {
        for (const territory of term.territories) {
          if (territory in territoriesISOA3) {
            this.territoryMarkers[territory] = toTerritoryMarker(territory, term.contractId, this.mandates);
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

  /** Whenever you click on a territory, add it to availsForm.territories. */
  public select(territory: TerritoryMarker) {
    const selected = this.shell.bucketForm.toggleTerritory(this.availsForm.value, territory);
    if (selected) this.shell.bucketForm.markAsDirty();
  }

  public selectAll() {
    this.available$.toPromise().then(available => {
      available.forEach(t => {
        const isAlreadyToggled = this.shell.bucketForm.isAlreadyToggled(this.availsForm.value, t);
        if (!isAlreadyToggled) {
          this.shell.bucketForm.toggleTerritory(this.availsForm.value, t);
        }
      });
    });
  }

  clear() {
    this.shell.avails.mapForm.reset();
  }
}
