import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { StateListGuard, FireQuery, Query } from '@blockframes/utils';
import { Movie, MovieStore } from '../+state';
import { OrganizationQuery } from '@blockframes/organization';
import { combineLatest, of } from 'rxjs';
import { switchMap, tap } from 'rxjs/operators';

const movieQuery = (id: string): Query<Movie> => ({
  path: `movies/${id}`
});

@Injectable({ providedIn: 'root' })
export class MovieListGuard extends StateListGuard<Movie> {
  urlFallback = 'layout';

  constructor(
    private fireQuery: FireQuery,
    private orgQuery: OrganizationQuery,
    store: MovieStore,
    router: Router
  ) {
    super(store, router);
  }

  get query() {
    const getMovies = (ids: string[]) => {
      return ids.map(id => this.fireQuery.fromQuery<Movie>(movieQuery(id)))
    };
    return this.orgQuery
      .select(state => state.org.movieIds)
      .pipe(
        switchMap(ids => {
          // if (ids.length === 0) throw this.router.parseUrl('noMovie')
          if (ids.length === 0) return of([])
          const queries = ids.map(id => this.fireQuery.fromQuery(movieQuery(id)))
          return combineLatest(queries)
        })
      );
  }
}
