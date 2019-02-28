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

  get form$() {
    return this.select(state => state.form);
  }
}
