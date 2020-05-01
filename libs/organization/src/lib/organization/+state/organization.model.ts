/** Gives information about an application */
import {
  OrganizationDocumentWithDates,
  WishlistDocumentWithDates,
  WishlistDocument,
  OrganizationDocument,
  createOrganizationRaw,
  PublicOrganization,
  createDenomination,
} from './organization.firestore';
import { Movie } from '@blockframes/movie/+state/movie.model';
import { toDate } from '@blockframes/utils/helpers';
import { createImgRef } from '@blockframes/utils/image-uploader';

export {
  OrganizationStatus,
  WishlistStatus,
  OrganizationDocument,
  createOrganizationDocument,
  PLACEHOLDER_LOGO
} from './organization.firestore';

export type AppStatus = 'none' | 'requested' | 'accepted';

/** 
 * An application details with the organization authorizations
 * @TODO (#2539) This is currently unused but we keep it to future uses.
 * */
/*export interface AppDetailsWithStatus extends AppDetails {
  status: AppStatus;
}*/


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


/** Convert an organization object into a public organization */
export function createPublicOrganization(org: Partial<Organization>): PublicOrganization {
  return {
    id: org.id || '',
    denomination: createDenomination(org.denomination),
    logo: createImgRef(org.logo)
  }
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
