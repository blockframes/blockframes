import { Injectable } from '@angular/core';
import { CollectionGuard, CollectionGuardConfig, awaitSyncQuery, Query } from 'akita-ng-fire';
import { MovieState, MovieService, MovieStore, Movie, fromOrg } from '../+state';
import { ContractQuery } from '@blockframes/contract/contract/+state/contract.query';
import { OrganizationQuery } from '@blockframes/organization/+state/organization.query';
import { tap, switchMap } from 'rxjs/operators';
import { of } from 'rxjs';


/** Query movies from the contract with distributions rights from the last version. */
const movieListContractQuery = (contractId: string, movieIds: string[]): Query<Movie[]> => ({
  path: 'movies',
  queryFn: ref => ref.where('id', 'in', movieIds),
  distributionRights: (movie: Movie) => ({
    path: `movies/${movie.id}/distributionRights`,
    queryFn: ref => ref.where('contractId', '==', contractId)
  })
});

@Injectable({ providedIn: 'root' })
@CollectionGuardConfig({ awaitSync: true })
export class MovieContractGuard extends CollectionGuard<MovieState> {
  constructor(
    service: MovieService,
    private store: MovieStore,
    private contractQuery: ContractQuery,
    private organizationQuery: OrganizationQuery,
    private movieService: MovieService
  ) {
    super(service);
  }

  /**
   * Sync on movies from contract.titleIds.
   * It means that this guard must always be used after the ActiveContractGuard.
   */
  sync() {
    return this.contractQuery.selectActive().pipe(
      // Reset the store everytime the movieId changes.
      tap(_ => this.store.reset()),
      switchMap(async contract => {
        // Filter movieIds before the query to relieve it.
        const orgId = this.organizationQuery.getActiveId();
        const movies = await this.movieService.getValue(fromOrg(orgId));
        const ids = movies.map(m => m.id);
        const movieIds = contract.titleIds.filter(titleId => ids.includes(titleId));
        return movieIds.length
          ? awaitSyncQuery.call(this.service, movieListContractQuery(contract.id, movieIds))
          : of([]);
      })
    );
  }
}

@Injectable({ providedIn: 'root' })
@CollectionGuardConfig({ awaitSync: true })
export class MovieListContractListGuard extends CollectionGuard<MovieState> {
  constructor(service: MovieService, private contractQuery: ContractQuery, private store: MovieStore) {
    super(service);
  }

  /** Sync all movies from contracts in the store */
  sync() {
    return this.contractQuery.selectAll().pipe(
      switchMap(contracts => {
        // Get all titleIds from contract and remove duplicates
        const rawTitleIds = new Set(contracts.map(c => c.titleIds));
        const titleIds = Array.from(rawTitleIds).flat();
        this.store.reset();
        return this.service.syncManyDocs(titleIds);
      })
    );
  }
}
