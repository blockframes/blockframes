/** Gives information about an application */
import { AppDetails, toDate } from '@blockframes/utils';
import {
  OrganizationDocumentWithDates,
  WishlistDocumentWithDates,
  WishlistDocument,
  OrganizationDocument,
  createOrganizationRaw
} from './organization.firestore';
import { Movie } from '@blockframes/movie';

export {
  OrganizationStatus,
  WishlistStatus,
  OrganizationDocument,
  createOrganizationDocument,
  PLACEHOLDER_LOGO
} from './organization.firestore';

export type AppStatus = 'none' | 'requested' | 'accepted';

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
    created: toDate(org.created), // prevent error in case the guard is wrongly called twice in a row
    updated: toDate(org.updated),
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
