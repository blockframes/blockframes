/** Gives information about an application */
import { AppDetails } from '@blockframes/utils';
import {
  OrganizationDocumentWithDates,
  WishlistDocumentWithDates,
  WishlistDocument,
  OrganizationDocument,
  createOrganizationRaw,
  Denomination
} from './organization.firestore';
import { Movie } from '@blockframes/movie';
import { CatalogCart } from '@blockframes/marketplace';

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

export type OrganizationWithTimestamps = OrganizationDocument;

export type Organization = OrganizationDocumentWithDates;

export interface Wishlist extends WishlistDocumentWithDates {
  movies?: Movie[];
}

export interface OrganizationForm {
  name: string;
}

export interface PublicOrganization {
  id: string;
  denomination: Denomination;
}

/** A factory function that creates an Organization. */
export function createOrganization(
  params: Partial<Organization> = {}
): Organization {
  const org = createOrganizationRaw(params) as Organization;

  return {
    ...org,
    // Here, "created" & "updated" fields are Date objects
    created: new Date(),
    updated: new Date(),
  }
}

/** Cleans an organization of its optional parameters */
export function cleanOrganization(organization: Organization) {
  return organization;
}

/** Convert an OrganizationWithTimestamps to an Organization (that uses Date). */
export function convertOrganizationWithTimestampsToOrganization(
  org: OrganizationWithTimestamps
): Organization {
  return {
    ...org,
    created: (org.created instanceof Date) ? org.created : org.created.toDate(), // prevent error in case the guard is wrongly called twice in a row
    updated: (org.updated instanceof Date) ? org.updated : org.updated.toDate(),
    wishlist: convertWishlistDocumentToWishlistDocumentWithDate(org.wishlist)
  };
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
