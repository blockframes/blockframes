import { Injectable } from '@angular/core';
import { StateActiveGuard, FireQuery, Query } from '@blockframes/utils';
import { Movie, MovieStore } from '../+state';
import { Router } from '@angular/router';

export const movieOrganizationActiveQuery = (id: string): Query<Movie> => ({
  path: `movies/${id}`,
});

@Injectable({ providedIn: 'root' })
export class MovieOrganizationActiveGuard extends StateActiveGuard<Movie> {
  readonly params = ['movieId'];
  readonly urlFallback: 'layout';

  constructor(private fireQuery: FireQuery, store: MovieStore, router: Router) {
    super(store, router);
  }

  query({ movieId }) {
    const query = movieOrganizationActiveQuery(movieId);
    return this.fireQuery.fromQuery<Movie>(query);
  }
}
