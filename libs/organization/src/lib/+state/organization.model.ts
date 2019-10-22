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

export interface Organization extends OrganizationDocument {
  members?: OrganizationMember[];
  baskets: CatalogBasket[]; // TODO: Create a specific Organization interface for Catalog Marketplace application => ISSUE#1062
}

export interface OrganizationForm {
  name: string;
}

export interface PublicOrganization {
  id: string;
  name: string;
}

