
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
  wishlist: WishlistWithDates[];
}

/** Status of an Organization, set to pending by default when an Organization is created. */
export const enum OrganizationStatus {
  pending = 'pending',
  accepted = 'accepted'
}

export interface WishlistRaw<D> {
  status: WishlistStatus,
  movieIds: string[],
  sent?: D
}
export interface WishlistDocument extends WishlistRaw<Timestamp> { }

export interface WishlistWithDates extends WishlistRaw<Date> { }


export const enum WishlistStatus {
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
    catalog: null,
    whishList: [],
    ...params
  };
}
