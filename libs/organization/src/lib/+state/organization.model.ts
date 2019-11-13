import { CatalogBasket } from '@blockframes/marketplace';
/** Gives information about an application */
import { AppDetails } from '@blockframes/utils';
import {
  OrganizationDocumentWithDates,
  WishlistDocumentWithDates,
  OrganizationDocument,
  OrganizationStatus,
  WishlistDocument
} from './organization.firestore';
import { Movie } from '@blockframes/movie';
export {
  OrganizationStatus,
  WishlistStatus,
  OrganizationDocument,
  createOrganizationDocument
} from './organization.firestore';

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

export interface OrganizationWithTimestamps extends OrganizationDocument {
  members?: OrganizationMember[]; // TODO #1061 prevent from saving to firestore
  operations?: OrganizationOperation[];
  actions?: OrganizationAction[];
  baskets: CatalogBasket[]; // TODO: Create a specific Organization interface for Catalog Marketplace application => ISSUE#1062
}

export interface Organization extends OrganizationDocumentWithDates {
  members?: OrganizationMember[];
  operations?: OrganizationOperation[];
  actions?: OrganizationAction[];
  baskets: CatalogBasket[]; // TODO: Create a specific Organization interface for Catalog Marketplace application => ISSUE#1062
  wishlist: Wishlist[];
}

export interface Wishlist extends WishlistDocumentWithDates {
  movies?: Movie[];
}

export interface OrganizationForm {
  name: string;
}

export interface PublicOrganization {
  id: string;
  name: string;
}

/** A factory function that creates an Organization. */
export function createOrganization(params: Partial<Organization> = {}): Organization {
  return {
    id: !!params.id ? params.id : '',
    name: '',
    email: '',
    fiscalNumber: '',
    activity: '',
    phoneNumber: '',
    address: '',
    officeAddress: '',
    status: OrganizationStatus.pending,
    userIds: [],
    movieIds: [],
    templateIds: [],
    created: Date.now(),
    updated: Date.now(),
    logo: PLACEHOLDER_LOGO,
    catalog: null,
    wishlist: [],
    baskets: [],
    ...params
  };
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

/** Convert an OrganizationWithTimestamps to an Organization (that uses Date). */
export function convertOrganizationWithTimestampsToOrganization(
  org: OrganizationWithTimestamps
): Organization {
  return { ...org, wishlist: convertWishlistDocumentToWishlistDocumentWithDate(org.wishlist) };
}

/** Convert a WishlistDocument to a WishlistDocumentWithDates (that uses Date). */
export function convertWishlistDocumentToWishlistDocumentWithDate(
  wishlist: WishlistDocument[]
): WishlistDocumentWithDates[] {
  if (!wishlist) {
    return [];
  }

  return wishlist.map(wish => {
    if (!!wish.sent) {
      return { ...wish, sent: wish.sent.toDate() };
    } else {
      return { ...wish, sent: null };
    }
  });
}
