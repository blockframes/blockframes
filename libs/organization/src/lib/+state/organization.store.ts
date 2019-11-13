import { Injectable } from '@angular/core';
import { Store, StoreConfig, EntityStore } from '@datorama/akita';
import { Organization } from './organization.model';
import { CollectionState } from 'akita-ng-fire';

export const enum DeploySteps { notDeployed, registered, resolved, ready };
export interface OrganizationState extends CollectionState<Organization> {
  org: Organization;
  form: {
    name: string,
    address: string
  };
  isDeploying: boolean;
  deployStep: DeploySteps;
}

// TODO #687: Create a proper interface for creating a organization
const initialState: OrganizationState = {
  org: null,
  active: null,
  form: {
    name: '',
    address: ''
  },
  isDeploying: false,
  deployStep: DeploySteps.notDeployed,
};
@Injectable({ providedIn: 'root' })
@StoreConfig({ name: 'organization' })
export class OrganizationStore extends EntityStore<OrganizationState, Organization> {
  constructor() {
    super(initialState);
  }

  public updateOrganization(org: Organization) {
    this.update(({ org }));
  }
}
