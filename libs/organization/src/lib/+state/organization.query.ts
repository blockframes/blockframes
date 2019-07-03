import { Injectable } from '@angular/core';
import { Query } from '@datorama/akita';
import { OrganizationState, OrganizationStore } from './organization.store';

@Injectable({
  providedIn: 'root'
})
export class OrganizationQuery extends Query<OrganizationState> {


  constructor(protected store: OrganizationStore) {
    super(store);
  }

  get form$() {
    return this.select(state => state.form);
  }
}
