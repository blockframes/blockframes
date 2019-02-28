import { Injectable } from '@angular/core';
import { EntityState, EntityStore, StoreConfig } from '@datorama/akita';
import { createOrganization, Organization } from './organization.model';

export interface OrganizationState extends EntityState<Organization> {
  form: Organization;
}

@Injectable({ providedIn: 'root' })
@StoreConfig({ name: 'organization', idKey: 'id' })
export class OrganizationStore extends EntityStore<OrganizationState, Organization> {
  constructor() {
    super({ form: createOrganization() });
  }
}
