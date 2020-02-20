import { Injectable } from '@angular/core';
import { QueryEntity } from '@datorama/akita';
import { ContractStore, ContractState } from './contract.store';
import { map, shareReplay, distinctUntilChanged, pluck, switchMap } from 'rxjs/operators';
import { getVersonView } from './contract.utils';
import { MovieQuery } from '@blockframes/movie';
import { ContractType } from './contract.firestore';
import { Contract } from './contract.model';

@Injectable({ providedIn: 'root' })
export class ContractQuery extends QueryEntity<ContractState> {

  /** There is only one mandate per organization */
  mandate$ = this.selectEntity((contract: Contract) => contract.type === ContractType.mandate);
  sales$ = this.selectAll({ filterBy: contract => contract.type === ContractType.sale });

  // @todo(#1887) 
  // don't look for the last version + move it to version query
  // Remove filter on _meta id
  public activeVersion$ = this.selectActive().pipe(
    map(contract => contract.versions.filter(version => version.id !== '_meta')),
    map(versions => versions[versions.length - 1])
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

  public oldVersionsView$ = this.selectActive().pipe(
    map(contract => contract.versions.filter(version => version.id !== '_meta')),
    map(versions => versions.filter((_, i) => i !== versions.length - 1)),
    map(versions => versions.map(getVersonView))
  );

  constructor(protected store: ContractStore, private movieQuery: MovieQuery) {
    super(store);
  }

  getMandate() {
    this.getEntity((contract: Contract) => contract.type === ContractType.mandate)
  }

}
