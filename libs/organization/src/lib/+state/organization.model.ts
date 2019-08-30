/** Gives information about an application */
import { App } from '../permissions/+state';

export interface AppDetails {
  name: string;
  logo: string;
  href: string;
  id: App;
}

export const enum AppStatus {
  none = 'none', // no request nor accept.
  requested = 'requested',
  accepted = 'accepted'
}

/** An application details with the organization authorizations */
export interface AppDetailsWithStatus extends AppDetails {
  status: AppStatus;
}

export const enum OrganizationStatus {
  pending = 'pending',
  accepted = 'accepted'
}

export interface OrganizationMemberRequest {
  email: string;
  roles: string[];
}

export interface OrganizationMember extends OrganizationMemberRequest {
  uid: string;
  name?: string;
  surname?: string;
  avatar?: string;
  role?: UserRole;
}

export const enum UserRole {
  admin = 'admin',
  member = 'member'
}

export interface OrganizationOperation {
  id: string;
  name: string;
  quorum: number;
  members: OrganizationMember[];
}

export interface OrganizationAction {
  id: string;
  opId: string;
  name: string;
  signers: OrganizationMember[];
  isApproved: boolean;
  approvalDate?: string;
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
  logo?: string;
}


export interface OrganizationForm {
  name: string;
  adress: string;
}

  // TODO get a good initial logo 
export const PLACEHOLDER_LOGO = 'https://images2.minutemediacdn.com/image/upload/c_crop,h_1193,w_2121,x_0,y_64/v1565279671/shape/mentalfloss/578211-gettyimages-542930526.jpg';

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
    logo: PLACEHOLDER_LOGO, 
    ...params
  } as Organization;
}


export function createOperation(operation: Partial<OrganizationOperation> = {}): OrganizationOperation {
  return {
    quorum: 0,
    members: [],
    ...operation,
  } as OrganizationOperation
}
