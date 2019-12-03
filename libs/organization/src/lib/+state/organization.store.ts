import { Injectable } from '@angular/core';
import {
  StoreConfig,
  EntityStore,
} from '@datorama/akita';
import { CollectionState } from 'akita-ng-fire';

import {
  Organization,
  convertOrganizationWithTimestampsToOrganization,
  AppDetailsWithStatus,
  OrganizationWithTimestamps,
} from './organization.model';


export interface OrganizationState extends CollectionState<Organization> {
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

  // TODO: #issue1288, type correctly organization
  akitaPreUpdateEntity(currentOrg: any, nextOrg: any) {
    return convertOrganizationWithTimestampsToOrganization(nextOrg);
  }
}
