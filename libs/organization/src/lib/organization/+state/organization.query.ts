import { Injectable } from '@angular/core';
import { QueryEntity } from '@datorama/akita';
import { OrganizationState, OrganizationStore } from './organization.store';
import { Organization } from './organization.model';
import { map, distinctUntilChanged } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class OrganizationQuery extends QueryEntity<OrganizationState, Organization> {
  constructor(protected store: OrganizationStore) {
    super(store);
  }

  /** listen on the list of movie ids from current org */
  movieIds$ = this.selectActive().pipe(
    map(org => org.movieIds),
    distinctUntilChanged((a, b) => a.length === b.length)
  );

  /** Check if the current organization has movies */
  hasMovies$ = this.selectActive().pipe(
    map(org => !!org.movieIds.length),
    distinctUntilChanged()
  );
}
