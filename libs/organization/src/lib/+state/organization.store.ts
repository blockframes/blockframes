import { Injectable } from '@angular/core';
import { Store, StoreConfig } from '@datorama/akita';
import { Organization, OrgForm, createOrganization } from './organization.model';

export interface OrganizationState {
  org: Organization;
  form: OrgForm;
}

const initialState: OrganizationState = {
  form: {
    name: '',
    adress: ''
  },
  // TODO #638: delete the mock file
  org: createOrganization({
    id: '123456789',
    name: 'MaxXAG',
    address: '0x0000000000000000000000000000000000000000',
    members: [
      {
        uid: '12e2d12',
        name: 'Hannah Arendt',
        email: 'hannahgoingwild@gmx.de',
        roles: ['Member'],
        activeActions: ['VitalikIsMyPilot']
      },
      {
        uid: '12e2d12',
        name: 'Hannah Arendt',
        email: 'hannahgoingwild@gmx.de',
        roles: ['Member'],
        activeActions: ['VitalikIsMyPilot']
      },
      {
        uid: '12e2d12',
        name: 'Hannah Arendt',
        email: 'hannahgoingwild@gmx.de',
        roles: ['Member'],
        activeActions: ['VitalikIsMyPilot']
      }
    ],
    actions: [
      {
        actionGroup: 'VitalikIsMyPilot',
        quorum: ['kwemfklmkl1'],
        activeMembers: ['Albert Camus', 'Hannah Arendt', 'Immanuel Kant']
      },
      {
        actionGroup: 'VitalikIsMyStewardess',
        quorum: ['kwemfklmkl1', 'kwemfklmkl1'],
        activeMembers: ['Albert Camus', 'Hannah Arendt', 'Immanuel Kant']
      },
      {
        actionGroup: 'VitalikIsMyCoPilot',
        quorum: ['kwemfklmkl1', 'kwemfklmkl1', 'kwemfklmkl1'],
        activeMembers: ['Albert Camus', 'Hannah Arendt', 'Immanuel Kant']
      }
    ]
  })
};

@Injectable({ providedIn: 'root' })
@StoreConfig({ name: 'organization' })
export class OrganizationStore extends Store<OrganizationState> {
  constructor() {
    super(initialState);
  }

  updateOrganization(organization: Partial<Organization>) {
    this.update(state => ({ org: { ...state.org, ...organization } }));
  }
}
