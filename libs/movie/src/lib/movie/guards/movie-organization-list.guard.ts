import { Injectable } from '@angular/core';
import { CollectionGuard } from 'akita-ng-fire';
import { MovieState, MovieService, MovieStore } from '../+state';
import { switchMap, tap } from 'rxjs/operators';
import { OrganizationQuery } from '@blockframes/organization/+state/organization.query';

/** Sync all movie from the active organization */
@Injectable({ providedIn: 'root' })
export class MovieOrganizationListGuard extends CollectionGuard<MovieState> {

  constructor(
    service: MovieService,
    private organizationQuery: OrganizationQuery,
    private store: MovieStore,
  ) {
    super(service);
  }

  /** Gets every movieIds of the user active organization and sync them. */
  sync() {
    return this.organizationQuery.selectActive().pipe(
      tap(_ => this.store.reset()),
      switchMap(org => this.service.syncManyDocs(org.movieIds))
    );
  }
}
