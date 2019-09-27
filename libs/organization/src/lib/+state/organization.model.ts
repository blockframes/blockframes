import { CatalogBasket } from '@blockframes/marketplace';
/** Gives information about an application */
import { AppDetails } from '@blockframes/utils';

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
  /** organization's office address, **not ethereum address**  */
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
  baskets: CatalogBasket[],
  logo?: string;
}


export interface OrganizationForm {
  name: string;
  adress: string;
}

export const PLACEHOLDER_LOGO = '/assets/logo/organisation_avatar_250.svg';

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
    catalog: null,
    ...params
  } as Organization;
}


export function createOperation(operation: Partial<OrganizationOperation> = {}): OrganizationOperation {
  return {
    quorum: 0,
    members: [],
    ...operation,
  } as OrganizationOperation;
}
