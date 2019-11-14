import { Injectable } from '@angular/core';
import { CollectionGuard, CollectionGuardConfig } from 'akita-ng-fire';
import { map } from 'rxjs/operators';
import { MovieState, MovieService, MovieQuery } from '../+state';
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { resolvePath } from '@blockframes/utils/routes';

@Injectable({ providedIn: 'root' })
@CollectionGuardConfig({ awaitSync: true })
export class MovieOrganizationListGuard extends CollectionGuard<MovieState> {
  constructor(protected service: MovieService, private query: MovieQuery) {
    super(service);
  }

  sync(next: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    return this.service.syncOrgMovies().pipe(
      map(_ => this.query.getCount()),
      map(count => (count === 0 ? resolvePath(state.url, '../create') : true))
    );
  }
}
