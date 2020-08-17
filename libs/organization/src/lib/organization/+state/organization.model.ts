/** Gives information about an application */
import {
  OrganizationDocumentWithDates,
  WishlistDocumentWithDates,
  WishlistDocument,
  createOrganizationBase,
  PublicOrganization,
  createDenomination,
} from './organization.firestore';
import { Movie } from '@blockframes/movie/+state/movie.model';
import { createHostedMedia } from '@blockframes/media/+state/media.firestore';

export {
  WishlistStatus,
  OrganizationDocument,
  createOrganizationDocument,
  PLACEHOLDER_LOGO
} from './organization.firestore';
export { OrganizationStatus } from '@blockframes/utils/static-model/types';

export type AppStatus = 'none' | 'requested' | 'accepted';

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
  const org = createOrganizationBase(params) as Organization;

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
    logo: createHostedMedia(org.logo)
  }
}

/** Convert a WishlistDocument to a WishlistDocumentWithDates (that uses Date). */
export function formatWishlistFromFirestore(
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
