import { Injectable } from '@angular/core';
import { CollectionGuard, CollectionGuardConfig, awaitSyncQuery, Query } from 'akita-ng-fire';
import { ContractService, ContractState, ContractStore, ContractWithTimeStamp } from '../+state';
import { tap, switchMap } from 'rxjs/operators';
import { MovieQuery } from '@blockframes/movie/+state/movie.query';

/** Get all the contracts where the active movie appears. */
// todo(#1887) remove versions in query
const movieContractsQuery = (movieId: string): Query<ContractWithTimeStamp[]> => ({
  path: 'contracts',
  queryFn: ref => ref.where('titleIds', 'array-contains', movieId).where('type', '==', 'sale'),
  versions: contract => ({
    path: `contracts/${contract.id}/versions`
  })
});

@Injectable({ providedIn: 'root' })
@CollectionGuardConfig({ awaitSync: true })
export class MovieContractListGuard extends CollectionGuard<ContractState> {
  constructor(
    service : ContractService,
    private store: ContractStore,
    private movieQuery: MovieQuery
  ) {
    super(service);
  }

  /**
   * Sync on the active movie contracts.
   */
  sync() {
    return this.movieQuery.selectActiveId().pipe(
      // Clear the store everytime the active movieId changes.
      tap(_ => this.store.reset()),
      switchMap(movieId => awaitSyncQuery.call(this.service, movieContractsQuery(movieId)))
    );
  }
}
