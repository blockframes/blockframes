import { Injectable } from '@angular/core';
import { QueryEntity } from '@datorama/akita';
import { OrganizationState, OrganizationStore } from './organization.store';
import { Organization } from './organization.model';
import { map, switchMap } from 'rxjs/operators';
import { combineLatest, Observable } from 'rxjs';
import { Template } from '@blockframes/material';

@Injectable({
  providedIn: 'root'
})
export class OrganizationQuery extends QueryEntity<OrganizationState, Organization> {
  constructor(protected store: OrganizationStore) {
    super(store);
  }

  public getOrgId(name: string) {
    const orgs = this.getAll({
      filterBy: org => org.name === name,
      limitTo: 0
    })
    return orgs[0].id;
  }

  get form$() {
    return this.select(state => state.form);
  }
}
