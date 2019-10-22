import { Injectable } from '@angular/core';
import { Store, StoreConfig } from '@datorama/akita';
import { Organization } from './organization.model';

export interface OrganizationState {
  org: Organization;
  form: {
    name: string,
    address: string
  };
}

// TODO #687: Create a proper interface for creating a organization
const initialState: OrganizationState = {
  org: null,
  form: {
    name: '',
    address: ''
  },
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
