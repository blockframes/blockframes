import { Injectable } from '@angular/core';
import { EntityState, EntityStore, StoreConfig, ActiveState } from '@datorama/akita';
import { Organization } from './organization.model';

export interface OrganizationState extends EntityState<Organization>, ActiveState<string>{
}

@Injectable({ providedIn: 'root' })
@StoreConfig({ name: 'organization', idKey: 'id' })
export class OrganizationStore extends EntityStore<OrganizationState, Organization>{
  constructor() {
    super({});
  }
}
