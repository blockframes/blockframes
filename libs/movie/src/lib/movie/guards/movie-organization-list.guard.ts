import { Injectable } from '@angular/core';
import { CollectionGuard, CollectionGuardConfig } from 'akita-ng-fire';
import { map } from 'rxjs/operators';
import { MovieState, MovieService, MovieQuery } from '../+state';

@Injectable({ providedIn: 'root' })
@CollectionGuardConfig({ awaitSync: true })
export class MovieOrganizationListGuard extends CollectionGuard<MovieState> {
  constructor(protected service: MovieService, private query: MovieQuery) {
    super(service);
  }

  sync() {
    return this.service.syncOrgMovies().pipe(
      map(_ => this.query.getCount()),
      map(count => (count === 0 ? 'layout/o/home/create' : true))
    );
  }
}
