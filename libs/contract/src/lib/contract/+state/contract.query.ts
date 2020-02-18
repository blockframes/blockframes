import { Injectable } from '@angular/core';
import { QueryEntity } from '@datorama/akita';
import { ContractStore, ContractState } from './contract.store';
import { map, shareReplay, distinctUntilChanged, pluck, switchMap } from 'rxjs/operators';
import { getVersonView } from './contract.utils';
import { MovieQuery } from '@blockframes/movie';

@Injectable({ providedIn: 'root' })
export class ContractQuery extends QueryEntity<ContractState> {

  // @todo(#1887) don't look for the last version
  public activeVersion$ = this.selectActive().pipe(
    map(contract => contract.versions[contract.versions.length - 1])
  );

  public activeVersionView$ = this.activeVersion$.pipe(
    map(getVersonView),
    shareReplay()
  );

  /** Get all movies of a contract */
  public titles$ = this.activeVersionView$.pipe(
    pluck('titleIds'),
    distinctUntilChanged((prev, next) => prev.length === next.length),
    switchMap(titeIds => this.movieQuery.selectMany(titeIds))
  )

  constructor(protected store: ContractStore, private movieQuery: MovieQuery) {
    super(store);
  }

}
