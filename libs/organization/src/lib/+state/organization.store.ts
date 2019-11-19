import { Injectable } from '@angular/core';
import { StoreConfig, EntityStore } from '@datorama/akita';
import { Organization, convertOrganizationWithTimestampsToOrganization, DeploySteps, AppDetailsWithStatus } from './organization.model';
import { CollectionState } from 'akita-ng-fire';

export interface OrganizationState extends CollectionState<Organization> {
  isDeploying: boolean;
  deployStep: DeploySteps;
  appsDetails: AppDetailsWithStatus[];
}

// TODO #687: Create a proper interface for creating a organization
const initialState: OrganizationState = {
  active: null,
  isDeploying: false,
  deployStep: DeploySteps.notDeployed,
  appsDetails: null
};
@Injectable({ providedIn: 'root' })
@StoreConfig({ name: 'organization' })
export class OrganizationStore extends EntityStore<OrganizationState, Organization> {
  constructor() {
    super(initialState);
  }

  // TODO: #issue1288, type correctly organization
  akitaPreAddEntity(organization: any): Organization {
    return convertOrganizationWithTimestampsToOrganization(organization);
  }

  // TODO: #issue1288, type correctly organization
  akitaPreUpdateEntity(currentOrg: any, nextOrg: any) {
    return convertOrganizationWithTimestampsToOrganization(nextOrg);
  }
}
