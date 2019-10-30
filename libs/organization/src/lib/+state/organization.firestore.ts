import { MovieMain } from '@blockframes/movie/types';
import { firestore } from "firebase/app";
type Timestamp = firestore.Timestamp;


/** Document model of an Organization */
export interface OrganizationDocument {
  id: string;
  name: string;
  address: string;
  officeAddress: string;
  email: string;
  created: number;
  updated: number;
  userIds: string[];
  movieIds: string[];
  templateIds: string[];
  status: OrganizationStatus;
  logo: string;
  phoneNumber: string;
  fiscalNumber: string;
  activity: string;
  wishList: WhishlistWithDates[];
}

/** Status of an Organization, set to pending by default when an Organization is created. */
export const enum OrganizationStatus {
  pending = 'pending',
  accepted = 'accepted'
}

export interface WhishlistRaw<D> {
  status: WhishListStatus,
  movieIds: string[],
  sent?: D
}

export interface WhishlistDocument extends WhishlistRaw<Timestamp> { }

export interface WhishlistWithDates extends WhishlistRaw<Date> { }

export const enum WhishListStatus {
  pending = 'pending',
  sent = 'sent'
}

/** Default placeholder logo used when an Organization is created. */
export const PLACEHOLDER_LOGO = '/assets/logo/organisation_avatar_250.svg';

/** A public interface or Organization, without sensitive data. */
export interface PublicOrganization {
  id: string;
  name: string;
}

export const enum WishlistStatus {
  pending = 'pending',
  submitted = 'submitted',
  accepted = 'accepted',
  paid = 'paid'
}

export interface Wishlist extends MovieMain {
  salesAgent: string;
  id: string;
  wishListStatus?: WishlistStatus;
  movieId: string;
}

/** A factory function that creates an Organization. */
export function createOrganization(
  params: Partial<OrganizationDocument> = {}
): OrganizationDocument {
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
    whishlist: [],
    ...params
  };
}
