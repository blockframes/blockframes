import { Router } from '@angular/router';
import { Injectable } from '@angular/core';
import { Movie } from '@blockframes/movie/movie/+state/movie.model';
import { MovieStore } from '@blockframes/movie/movie/+state/movie.store';
import { Query } from '@blockframes/utils/firequery/types';
import { StateActiveGuard } from '@blockframes/utils/abstract-state-guard';
import { FireQuery } from '@blockframes/utils/firequery/firequery';

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
