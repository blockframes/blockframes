import { Injectable } from '@angular/core';
import { Store, StoreConfig } from '@datorama/akita';
import { Organization, OrgForm } from './organization.model';

export interface OrganizationState {
  org: Organization,
  form: OrgForm
}

const initialState: OrganizationState  = {
  form: {
    name: '',
    adress: ''
  },
  org: null
}

@Injectable({ providedIn: 'root' })
@StoreConfig({ name: 'organization' })
export class OrganizationStore extends Store<OrganizationState>{
  constructor() {
    super(initialState);
  }
}
