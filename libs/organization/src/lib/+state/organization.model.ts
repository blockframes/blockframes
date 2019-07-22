export interface OrgMember {
  uid: string;
  name?: string;
  email: string;
  roles: string[];
  activeActions?: string[];
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
  members?: OrgMember[];
  actions?: Action[];
}

export interface OrgForm {
  name: string;
  adress: string;
}

export interface Action {
  actionGroup: string;
  quorum: string[];
  activeMembers: string[];
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
