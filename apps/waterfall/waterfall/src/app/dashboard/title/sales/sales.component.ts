import { ChangeDetectionStrategy, Component } from '@angular/core';
import { combineLatest, Observable, of } from 'rxjs';
import { map, shareReplay, switchMap } from 'rxjs/operators';
import { filterContractsByTitle, TerritoryValue, Contract, Term, Movie, isSale, territoriesSold, TerritorySoldMarker } from '@blockframes/model';
import { ContractService } from '@blockframes/contract/contract/service';
import { TermService } from '@blockframes/contract/term/service';
import { where } from 'firebase/firestore';
import { DashboardTitleShellComponent } from '@blockframes/movie/dashboard/shell/shell.component';


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
  private sales$ = this.contracts$.pipe(map((contracts) => contracts.filter(isSale)));
  private salesTerms$ = this.getTerms(this.sales$);

  public hoveredTerritory: {
    name: string;
    status: string;
  }

  public clickedTerritory: {
    name: string;
  }

  public territoriesSold$ = combineLatest([
    this.shell.movie$,
    this.sales$,
    this.salesTerms$,
  ]).pipe(
    map(([movie, sales, salesTerms]) => {
      const res = filterContractsByTitle(movie.id, [], [], sales, salesTerms);
      return territoriesSold(res.sales);
    }),
    shareReplay({ bufferSize: 1, refCount: true }),
  );

  constructor(
    private termsService: TermService,
    private contractService: ContractService,
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
  public displayTerritoryTooltip(territory: TerritoryValue, status: string) {
    this.hoveredTerritory = { name: territory, status };
  }

  /** Clear the territories information */
  public clearTerritoryTooltip() {
    this.hoveredTerritory = null;
  }

  public showDetails(territory: TerritorySoldMarker) {
    if (this.clickedTerritory?.name === territory.label) this.clickedTerritory = null;
    else this.clickedTerritory = { name: territory.label };
  }

  public closeDetails() {
    this.clickedTerritory = null;
  }
}
