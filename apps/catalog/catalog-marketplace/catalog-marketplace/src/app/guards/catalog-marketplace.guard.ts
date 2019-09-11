import { Router } from '@angular/router';
import { Injectable } from '@angular/core';
import { Movie, MovieStore } from '@blockframes/movie';
import { Query, StateActiveGuard, FireQuery } from '@blockframes/utils';

export const catalogMarketplaceActiveMovie = (id: string): Query<Movie> => ({
  path: `movies/${id}`
});

@Injectable({ providedIn: 'root' })
export class CatalogMarketPlaceGuard extends StateActiveGuard<Movie> {
  readonly params = ['movieId'];
  readonly urlFallback: 'layout';

  constructor(private fireQuery: FireQuery, store: MovieStore, router: Router) {
    super(store, router);
  }

  query({ movieId }) {
    const query = catalogMarketplaceActiveMovie(movieId);
    return this.fireQuery.fromQuery<Movie>(query);
  }
}
