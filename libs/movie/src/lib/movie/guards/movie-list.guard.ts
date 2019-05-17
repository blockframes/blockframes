import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { StateListGuard, FireQuery, Query } from '@blockframes/utils';
import { Movie, MovieStore } from '../+state';
import { OrganizationQuery } from '@blockframes/organization';
import { switchMap, map } from 'rxjs/operators';

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
    return this.orgQuery.selectAll().pipe(
      map(orgs => orgs.reduce((acc, org) => [...acc, ...org.movieIds], [])),
      map(movieIds => movieIds.map(id => movieQuery(id))),
      switchMap(query => this.fireQuery.fromQuery(query))
    );
  }
}
