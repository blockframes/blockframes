import { Injectable } from '@angular/core';
import { QueryEntity } from '@datorama/akita';
import { OrganizationState, OrganizationStore } from './organization.store';
import { OrganizationStatus, Organization } from './organization.model';
import { filter, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class OrganizationQuery extends QueryEntity<OrganizationState, Organization> {
  constructor(protected store: OrganizationStore) {
    super(store);
  }

  /**
   * An Observable that describe the list
   * of application that are accessible to the current
   * organization.
   */
  public appsDetails$ = this.select(state => state.appsDetails);

  public isAccepted$ = this.selectActive().pipe(
    filter(org => !!org),
    map(org => org.status === OrganizationStatus.accepted)
  );
}
