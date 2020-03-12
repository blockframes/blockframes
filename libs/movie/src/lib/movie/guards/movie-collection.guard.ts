import { MovieService } from './../+state/movie.service';
import { MovieState } from './../+state/movie.store';
import { Injectable } from '@angular/core';
import { CollectionGuard, syncQuery } from 'akita-ng-fire';
import { MovieQuery } from '../+state/movie.query';
import { Movie } from '../+state/movie.model';

/** Query all the movies with their distributionDeals */
const movieListWithDealsQuery = () => ({
  path: 'movies',
  queryFn: ref => ref.where('main.storeConfig.status', '==', 'accepted'),
  distributionDeals: (movie: Movie) => ({
    path: `movies/${movie.id}/distributionDeals`
  })
});

@Injectable({ providedIn: 'root' })
export class MovieCollectionGuard extends CollectionGuard<MovieState> {
  constructor(service: MovieService, private query: MovieQuery) {
    super(service);
  }

  get awaitSync() {
    return this.query.getCount() === 0;
  }

  sync() {
    return syncQuery.call(this.service, movieListWithDealsQuery());
  }
}
