import { Injectable } from '@angular/core';
import { QueryEntity } from '@datorama/akita';
import { OrganizationState, OrganizationStore } from './organization.store';
import { Organization } from './organization.model';

@Injectable({
  providedIn: 'root'
})
export class OrganizationQuery extends QueryEntity<OrganizationState, Organization> {
  constructor(protected store: OrganizationStore) {
    super(store);
  }

  /**
   * @TODO (#2539) This is currently unused but we keep it to future uses.
   * An Observable that describe the list
   * of application that are accessible to the current
   * organization.
   */
  //public appsDetails$ = this.select(state => state.appsDetails);

}
