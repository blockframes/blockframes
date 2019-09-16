import { Router } from '@angular/router';
import { Injectable } from '@angular/core';
import { Movie, MovieStore } from '@blockframes/movie';
import { Query, StateActiveGuard, FireQuery } from '@blockframes/utils';

export const catalogMovieActtive = (id: string): Query<Movie> => ({
  path: `movies/${id}`
});

@Injectable({ providedIn: 'root' })
export class CatalogMovieActiveGuard extends StateActiveGuard<Movie> {
  readonly params = ['movieId'];
  readonly urlFallback: 'layout/o/catalog/search';

  constructor(private fireQuery: FireQuery, store: MovieStore, router: Router) {
    super(store, router);
  }

  query({ movieId }) {
    const query = catalogMovieActtive(movieId);
    return this.fireQuery.fromQuery<Movie>(query);
  }
}
