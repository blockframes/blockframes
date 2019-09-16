import { Router } from '@angular/router';
import { Injectable } from '@angular/core';
import { Query, StateListGuard, FireQuery } from '@blockframes/utils';
import { Movie, MovieStore } from '@blockframes/movie';

export const catalogMovieListQuery = (): Query<Movie> => ({
  path: `movies`
});
@Injectable({ providedIn: 'root' })
export class CatalogMovieListGuard extends StateListGuard<Movie> {
  public params = [];
  public urlFallback = '/layout/o/catalog/home';

  constructor(private fireQuery: FireQuery, store: MovieStore, router: Router) {
    super(store, router);
  }

  get query() {
    const query = catalogMovieListQuery();
    return this.fireQuery.fromQuery<Movie[]>(query);
  }
}
