import { Injectable } from '@angular/core';
import {
  StoreConfig,
  EntityStore,
  ActiveState,
  EntityState,
} from '@datorama/akita';

import { Organization } from './organization.model';

export interface OrganizationState extends EntityState<Organization>, ActiveState<string> { }

// TODO #687: Create a proper interface for creating a organization
const initialState: OrganizationState = { active: null };
@Injectable({ providedIn: 'root' })
@StoreConfig({ name: 'organization' })
export class OrganizationStore extends EntityStore<OrganizationState, Organization> {
  constructor() {
    super(initialState);
  }
}
