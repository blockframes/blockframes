import { Injectable } from '@angular/core';
import { QueryEntity } from '@datorama/akita';
import { ContractStore, ContractState } from './contract.store';
import { map, shareReplay, distinctUntilChanged, pluck, switchMap, filter } from 'rxjs/operators';
import { getVersionView } from './contract.utils';
import { MovieQuery } from '@blockframes/movie/+state/movie.query';
import { Contract } from './contract.model';
import { Party } from '@blockframes/utils/common-interfaces/identity';

@Injectable({ providedIn: 'root' })
export class ContractQuery extends QueryEntity<ContractState> {

  /** There is only one mandate per organization */
  public mandate$ = this.selectEntity((contract: Contract) => contract.type === 'mandate');
  public sales$ = this.selectAll({ filterBy: contract => contract.type === 'sale' });
  public activeVersion$ = this.selectActive(contract => contract.lastVersion);

  public activeVersionView$ = this.activeVersion$.pipe(
    /* f user goes back, this will call the getVersionView with an undefined value, and this throws an error */
    filter(value => !!value),
    map(getVersionView),
    shareReplay()
  );

  /** Get all movies of a contract */
  public titles$ = this.activeVersionView$.pipe(
    pluck('titleIds'),
    distinctUntilChanged((prev, next) => prev.length === next.length),
    switchMap(titeIds => this.movieQuery.selectMany(titeIds))
  )

  /**
   * @dev Listens to all historized versions of the contract except the current version
   */
  public versionsView$ = this.selectActive().pipe(
    filter(contract => !!contract),
    map(contract => contract.versions.filter((_, i) => i !== contract.lastVersion.id)),
    filter(versions => !!versions),
    map(versions => versions.map(getVersionView))
  );

  /** Get subLicensors of the active contract */
  public subLicensors$ = this.selectActive().pipe(
    filter(contract => !!contract),
    map(contract => contract.parties.filter(p => p.childRoles.length > 0))
  );

  constructor(protected store: ContractStore, private movieQuery: MovieQuery) {
    super(store);
  }

  /** Returns the contract parties of a given role */
  getActiveParties(role: 'licensee' | 'licensor'): Party[] {
    const parties = this.getActive().parties.filter(details => details.party.role === role);
    return parties.map(details => details.party);
  }

}
