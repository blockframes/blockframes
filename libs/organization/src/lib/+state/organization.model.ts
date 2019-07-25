export interface OrganizationMemberRequest {
  email: string;
  roles: string[];
  /** Array of ids from OrganizationAction */
  activeOnActions?: string[];
}

export interface OrganizationMember extends OrganizationMemberRequest {
  uid: string;
  name?: string;
}

export interface Organization {
  id: string;
  name: string;
  address: string;
  phoneNumber: string;
  created: number;
  updated: number;
  movieIds: string[];
  templateIds: string[];
  userIds: string[];
  members?: OrganizationMember[];
  actions: OrganizationAction[]
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
    actions: [],
    members: [],
    ...params
  } as Organization;
}
