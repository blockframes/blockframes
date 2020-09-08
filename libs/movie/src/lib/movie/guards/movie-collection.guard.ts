import { MovieService } from './../+state/movie.service';
import { MovieState } from './../+state/movie.store';
import { Injectable } from '@angular/core';
import { CollectionGuard, syncQuery, CollectionGuardConfig } from 'akita-ng-fire';
import { MovieQuery } from '../+state/movie.query';
import { Movie } from '../+state/movie.model';

/** Query all the movies with their distributionRights */
const movieListWithRightsQuery = () => ({
  path: 'movies',
  queryFn: ref => ref.where('storeConfig.status', '==', 'accepted'),
  distributionRights: (movie: Movie) => ({
    path: `movies/${movie.id}/distributionRights`
  })
});

@Injectable({ providedIn: 'root' })
@CollectionGuardConfig({ awaitSync: true })
export class MovieCollectionGuard extends CollectionGuard<MovieState> {
  constructor(service: MovieService, private query: MovieQuery) {
    super(service);
  }

  sync() {
    return syncQuery.call(this.service, movieListWithRightsQuery());
  }
}
