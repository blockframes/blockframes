import { Injectable } from '@angular/core';
import { QueryEntity } from '@datorama/akita';
import { OrganizationState, OrganizationStore } from './organization.store';
import { Organization } from './organization.model';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class OrganizationQuery extends QueryEntity<OrganizationState, Organization> {

  public templates$ = this.selectAll().pipe(
    map(orgs => orgs.map(org => ( org.templates ))
  ))


  constructor(protected store: OrganizationStore) {
    super(store);
  }

  get form$() {
    return this.select(state => state.form);
  }
}
