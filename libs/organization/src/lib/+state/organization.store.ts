import { Injectable } from '@angular/core';
import { Store, StoreConfig } from '@datorama/akita';
import { Organization, createOrganization } from './organization.model';

export const enum DeploySteps { notDeployed, registered, resolved, ready };
export interface OrganizationState {
  org: Organization;
  form: any;
  deployStep: DeploySteps;
}

// TODO #687: Create a proper interface for creating a organization
const initialState: OrganizationState = {
  form: {
    name: '',
    address: ''
  },
  org: null,
  deployStep: DeploySteps.notDeployed,
};
@Injectable({ providedIn: 'root' })
@StoreConfig({ name: 'organization' })
export class OrganizationStore extends Store<OrganizationState> {
  constructor() {
    super(initialState);
  }

  updateOrganization(organization: Partial<Organization>) {
    const org = createOrganization(organization);
    this.update(({ org }));
  }
}
