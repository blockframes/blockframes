import { CatalogBasket } from '@blockframes/marketplace';
/** Gives information about an application */
import { AppDetails } from '@blockframes/utils';
import { OrganizationDocument } from './organization.firestore';
export { OrganizationStatus, createOrganization, PLACEHOLDER_LOGO } from './organization.firestore';

export const enum AppStatus {
  none = 'none', // no request nor accept.
  requested = 'requested',
  accepted = 'accepted'
}

/** An application details with the organization authorizations */
export interface AppDetailsWithStatus extends AppDetails {
  status: AppStatus;
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

export interface Organization extends OrganizationDocument {
  members?: OrganizationMember[];
  operations?: OrganizationOperation[];
  actions?: OrganizationAction[];
  baskets: CatalogBasket[]
}

export interface OrganizationForm {
  name: string;
  adress: string;
}

export function createOperation(operation: Partial<OrganizationOperation> = {}): OrganizationOperation {
  return {
    quorum: 0,
    members: [],
    ...operation,
  } as OrganizationOperation;
}
