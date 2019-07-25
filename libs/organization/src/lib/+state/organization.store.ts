import { Injectable } from '@angular/core';
import { Store, StoreConfig } from '@datorama/akita';
import { Organization, createOrganization } from './organization.model';

export interface OrganizationState {
  org: Organization;
  form: any;
}

// TODO #687
const initialState: OrganizationState = {
  form: {
    name: '',
    adress: ''
  },
  org: null
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
