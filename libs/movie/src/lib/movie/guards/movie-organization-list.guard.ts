import { Injectable } from '@angular/core';
import { CollectionGuard } from 'akita-ng-fire';
import { MovieState, MovieService, MovieQuery } from '../+state';

@Injectable({ providedIn: 'root' })
export class MovieOrganizationListGuard extends CollectionGuard<MovieState> {
  constructor(protected service: MovieService, private query: MovieQuery) {
    super(service);
  }

  get awaitSync() {
    return this.query.getCount() === 0;
  }

  sync() {
    return this.service.syncOrgMovies();
  }
}
