import { Injectable } from '@angular/core';
import { Store, StoreConfig } from '@datorama/akita';
import { Organization } from './organization.model';

export const enum DeploySteps { notDeployed, registered, resolved, ready };
export interface OrganizationState {
  org: Organization;
  form: {
    name: string,
    address: string
  };
  deployStep: DeploySteps;
}

// TODO #687: Create a proper interface for creating a organization
const initialState: OrganizationState = {
  org: null,
  form: {
    name: '',
    address: ''
  },
  deployStep: DeploySteps.notDeployed,
};
@Injectable({ providedIn: 'root' })
@StoreConfig({ name: 'organization' })
export class OrganizationStore extends Store<OrganizationState> {
  constructor() {
    super(initialState);
  }

  public updateOrganization(org: Organization) {
    this.update(({ org }));
  }
}
