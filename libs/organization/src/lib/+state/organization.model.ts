export interface OrganizationMember {
  uid: string;
  name?: string;
  email: string;
  roles: string[];
  /** Array of ids from OrganizationAction */
  activeOnActions?: string[];
}

export interface Organization {
  id: string;
  name: string;
  address: string;
  created: number;
  updated: number;
  movieIds: string[];
  templateIds: string[];
  userIds: string[];
  members?: OrganizationMember[];
  actions: OrganizationAction[]
}

export interface OrganizationForm {
  name: string;
  adress: string;
}

export interface OrganizationAction {
  id: string;
  actionName: string;
  quorumMembers: number;
  /** Array of uids from OrganizationMember. The u of uids stands for user not unique */
  activeMembers: OrganizationMember[];
}
/**
 * A factory function that creates an Organization
 */
export function createOrganization(params: Partial<Organization> = {}): Organization {
  return {
    id: '',
    name: '',
    address: '',
    userIds: [],
    movieIds: [],
    templateIds: [],
    created: Date.now(),
    updated: Date.now(),
    ...params
  } as Organization;
}
