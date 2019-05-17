import { Injectable } from '@angular/core';
import { StateActiveGuard, FireQuery, Query } from '@blockframes/utils';
import { Movie, MovieStore } from '../+state';
import { Router } from '@angular/router';

export const movieActiveQuery = (movieId: string): Query<Movie> => ({
  path: `movies/${movieId}`
});

@Injectable({ providedIn: 'root' })
export class MovieActiveGuard extends StateActiveGuard<Movie> {
  readonly params = ['movieId'];
  readonly urlFallback: 'layout';

  constructor(private fireQuery: FireQuery, store: MovieStore, router: Router) {
    super(store, router);
  }

  query({ movieId }) {
    const query = movieActiveQuery(movieId);
    return this.fireQuery.fromQuery(query);
  }
}
