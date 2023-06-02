import { ChangeDetectionStrategy, Component } from '@angular/core';
import { combineLatest, Observable, of } from 'rxjs';
import { map, shareReplay, switchMap, tap } from 'rxjs/operators';
import {
  filterContractsByTitle,
  Contract,
  Term,
  Movie,
  isSale,
  territoriesSold,
  TerritorySoldMarker,
  isMandate,
  ContractType,
  Media,
  Territory,
  Organization,
  externalOrgIdentifier
} from '@blockframes/model';
import { ContractService } from '@blockframes/contract/contract/service';
import { TermService } from '@blockframes/contract/term/service';
import { where } from 'firebase/firestore';
import { DashboardTitleShellComponent } from '@blockframes/movie/dashboard/shell/shell.component';
import { OrganizationService } from '@blockframes/organization/service';

@Component({
  selector: 'waterfall-title-sales',
  templateUrl: './sales.component.html',
  styleUrls: ['./sales.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SalesComponent {

  private contracts$ = this.shell.movie$.pipe(
    switchMap((movie: Movie) => this.contractService.valueChanges([
      where('titleId', '==', movie.id),
      where('status', '==', 'accepted')
    ]))
  );

  private mandates$ = this.contracts$.pipe(map((contracts) => contracts.filter(isMandate)));
  private mandateTerms$ = this.getTerms(this.mandates$);
  private sales$ = this.contracts$.pipe(map((contracts) => contracts.filter(isSale)));
  private salesTerms$ = this.getTerms(this.sales$);

  public hoveredTerritory: {
    name: string;
    data: string;
  }

  public clickedTerritory: {
    name: string;
    infos: {
      buyerName: string,
      type: ContractType,
      duration: Duration,
      medias: Media[];
      territories: Territory[];
    }[]
  }

  public territoriesSold$ = combineLatest([
    this.shell.movie$,
    this.sales$,
    this.salesTerms$,
    this.mandates$,
    this.mandateTerms$
  ]).pipe(
    map(([movie, sales, salesTerms, mandates, mandateTerms]) => {
      const res = filterContractsByTitle(movie.id, mandates, mandateTerms, sales, salesTerms);
      return territoriesSold([...res.mandates, ...res.sales]);
    }),
    tap(async markers => {
      const allMarkers = Object.values(markers).flat();
      const orgIds = Array.from(new Set(allMarkers.map(t => t.data?.filter(s => s.buyerId).map(s => s.buyerId)).flat().filter(o => !!o)));
      if (orgIds.length) this.orgsCache = await this.orgService.getValue(orgIds);
    }),
    shareReplay({ bufferSize: 1, refCount: true }),
  );

  private orgsCache: Organization[] = [];

  constructor(
    private termsService: TermService,
    private contractService: ContractService,
    private orgService: OrganizationService,
    private shell: DashboardTitleShellComponent,
  ) { }

  private getTerms(contracts$: Observable<Contract[]>) {
    return contracts$.pipe(
      switchMap((contract) => {
        const list = contract.flatMap((movie) => movie.termIds);
        if (list.length === 0) return of([]) as Observable<Term[]>;
        return this.termsService.valueChanges(list);
      })
    );
  }

  /** Display the territories information in the tooltip */
  public displayTerritoryTooltip(territory: TerritorySoldMarker) {
    if (territory.data) {
      const orgIds = Array.from(new Set(territory.data.filter(s => s.buyerId).map(s => s.buyerId)));
      const orgs = this.orgsCache.filter(o => orgIds.includes(o.id));
      this.hoveredTerritory = { name: territory.label, data: orgs.length ? orgs[0].name : externalOrgIdentifier };
    } else {
      this.hoveredTerritory = { name: territory.label, data: 'Available' };
    }

  }

  /** Clear the territories information */
  public clearTerritoryTooltip() {
    this.hoveredTerritory = null;
  }

  public showDetails(territory: TerritorySoldMarker) {
    if (this.clickedTerritory?.name === territory.label) this.clickedTerritory = null;
    else {
      const orgIds = Array.from(new Set(territory.data.filter(s => s.buyerId).map(s => s.buyerId)));
      const orgs = this.orgsCache.filter(o => orgIds.includes(o.id));
      const infos = [];
      for (const contract of territory.data) {
        for (const term of contract.terms) {
          const termInfos = {
            buyerName: contract.buyerId ? orgs.find(o => o.id === contract.buyerId).name : externalOrgIdentifier,
            type: contract.type,
            // TODO #9372 signature
            duration: term.duration,
            medias: term.medias,
            territories: term.territories,
            // TODO #9372 declared amount
            // TODO #9372 amount paid
          }

          infos.push(termInfos);
        }
      }
      this.clickedTerritory = { name: territory.label, infos };
    }
  }

  public closeDetails() {
    this.clickedTerritory = null;
  }
}
