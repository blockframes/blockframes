export enum OrganizationStatus {
  pending = 'pending',
  accepted = 'accepted'
}

export interface OrganizationMemberRequest {
  email: string;
  roles: string[];
  /** Array of ids from OrganizationAction */
  activeOnActions?: string[];
}

export interface OrganizationMember extends OrganizationMemberRequest {
  uid: string;
  name?: string;
  avatar?: string;
}

export interface OrganizationOperation {
  id: string;
  name: string;
	quorum: number;
	members: OrganizationMember[]
}

export interface OrganizationAction {
  id: string,
  opid: string,
  name: string,
  signers: OrganizationMember[],
  isApproved: boolean,
  approvalDate?: string,
}

export interface Organization {
  id: string;
  status: OrganizationStatus; // is the organization accepted by cascade8 admins?
  name: string;
  address: string;
  phoneNumber: string;
  created: number;
  updated: number;
  movieIds: string[];
  templateIds: string[];
  userIds: string[];
  members?: OrganizationMember[];
  operations?: OrganizationOperation[];
  actions?: OrganizationAction[];
}

export interface OrganizationForm {
  name: string;
  adress: string;
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
