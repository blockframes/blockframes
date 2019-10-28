import { CatalogBasket } from '@blockframes/marketplace';
/** Gives information about an application */
import { AppDetails } from '@blockframes/utils';
import { OrganizationDocument, WhishListWithDates } from './organization.firestore';
import { Movie } from '@blockframes/movie';
export { OrganizationStatus, createOrganization } from './organization.firestore';

export const enum AppStatus {
  none = 'none', // no request nor accept.
  requested = 'requested',
  accepted = 'accepted'
}

export const PLACEHOLDER_LOGO = '/assets/logo/organisation_avatar_250.svg';

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
  baskets: CatalogBasket[]; // TODO: Create a specific Organization interface for Catalog Marketplace application => ISSUE#1062
}

export interface WishList extends WhishListWithDates {
  movies?: Movie[];
}

export interface OrganizationForm {
  name: string;
}

export interface PublicOrganization {
  id: string;
  name: string;
}

export function createOperation(
  operation: Partial<OrganizationOperation> = {}
): OrganizationOperation {
  return {
    quorum: 0,
    members: [],
    ...operation
  } as OrganizationOperation;
}
