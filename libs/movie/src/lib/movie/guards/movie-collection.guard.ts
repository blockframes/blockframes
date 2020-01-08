import { MovieService } from './../+state/movie.service';
import { MovieState } from './../+state/movie.store';
import { Injectable } from '@angular/core';
import { CollectionGuard } from 'akita-ng-fire';
import { MovieQuery } from '../+state/movie.query';

@Injectable({ providedIn: 'root' })
export class MovieCollectionGuard extends CollectionGuard<MovieState> {
  constructor(service: MovieService, private query: MovieQuery) {
    super(service);
  }

  get awaitSync() {
    return this.query.getCount() === 0;
  }
}
