import { Injectable } from '@angular/core';
import {
  StoreConfig,
  EntityStore,
  ActiveState,
  EntityState,
} from '@datorama/akita';

import {
  Organization,
  convertOrganizationWithTimestampsToOrganization,
  AppDetailsWithStatus,
  OrganizationWithTimestamps,
} from './organization.model';


export interface OrganizationState extends EntityState<Organization>, ActiveState<string> {
  appsDetails: AppDetailsWithStatus[];
}

// TODO #687: Create a proper interface for creating a organization
const initialState: OrganizationState = {
  active: null,
  appsDetails: null
};
@Injectable({ providedIn: 'root' })
@StoreConfig({ name: 'organization' })
export class OrganizationStore extends EntityStore<OrganizationState, Organization> {
  constructor() {
    super(initialState);
  }

  akitaPreAddEntity(organization: OrganizationWithTimestamps): Organization {
    return convertOrganizationWithTimestampsToOrganization(organization);
  }

  akitaPreUpdateEntity(currentOrg: Organization, nextOrg: OrganizationWithTimestamps) {
    return convertOrganizationWithTimestampsToOrganization(nextOrg);
  }
}
