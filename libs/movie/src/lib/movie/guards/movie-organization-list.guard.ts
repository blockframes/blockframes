import { Injectable } from '@angular/core';
import { CollectionGuard } from 'akita-ng-fire';
import { MovieState, MovieService, MovieQuery } from '../+state';
import { switchMap } from 'rxjs/operators';
import { OrganizationQuery } from '@blockframes/organization/+state/organization.query';

/** Sync all movie from the active organization */
@Injectable({ providedIn: 'root' })
export class MovieOrganizationListGuard extends CollectionGuard<MovieState> {
  constructor(
    service: MovieService,
    private query: MovieQuery,
    private organizationQuery: OrganizationQuery
  ) {
    super(service);
  }

  get awaitSync() {
    return this.query.getCount() === 0;
  }

  /** Gets every movieIds of the user active organization and sync them. */
  sync() {
    return this.organizationQuery.selectActive().pipe(
      switchMap(org => this.service.syncManyDocs(org.movieIds))
    );
  }
}
