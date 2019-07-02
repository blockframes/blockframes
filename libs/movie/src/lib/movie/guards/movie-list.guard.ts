import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { StateListGuard, FireQuery, Query } from '@blockframes/utils';
import { Movie, MovieStore } from '../+state';
import { OrganizationQuery } from '@blockframes/organization';
import { combineLatest } from 'rxjs';
import { switchMap } from 'rxjs/operators';

const movieQuery = (id: string): Query<Movie> => ({
  path: `movies/${id}`
});

@Injectable({ providedIn: 'root' })
export class MovieListGuard extends StateListGuard<Movie> {
  urlFallback = '/layout/o/home/create';

  constructor(
    private fireQuery: FireQuery,
    private orgQuery: OrganizationQuery,
    store: MovieStore,
    router: Router
  ) {
    super(store, router);
  }

  get query() {
    return this.orgQuery
      .select(state => state.org.movieIds)
      .pipe(
        switchMap(ids => {
          if (!ids || ids.length === 0) throw new Error('No movie yet')
          const queries = ids.map(id => this.fireQuery.fromQuery<Movie>(movieQuery(id)))
          return combineLatest(queries)
        })
      );
  }
}
