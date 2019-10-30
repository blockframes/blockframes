
import { firestore } from "firebase/app";
type Timestamp = firestore.Timestamp;


/** Document model of an Organization */
interface OrganizationRaw<D> {
  id: string;
  name: string;
  addresses: Addresses;
  email: string;
  created: number;
  updated: number;
  userIds: string[];
  movieIds: string[];
  templateIds: string[];
  status: OrganizationStatus;
  catalog: null; // @todo #1126 késako ?
  logo: string;
  fiscalNumber: string;
  activity: string;
  // TODO: issue#1202 Review model of Wishlist (name, date...)
  wishlist: WishlistRaw<D>[];
}

export interface OrganizationDocument extends OrganizationRaw<Timestamp> {}

export interface OrganizationDocumentWithDates extends OrganizationRaw<Date> {}

/** Status of an Organization, set to pending by default when an Organization is created. */
export const enum OrganizationStatus {
  pending = 'pending',
  accepted = 'accepted'
}

export interface Addresses {
  main: Address,
  billing?: Address,
  office?: Address,
  // Other can be added here
}

export interface Address {
  street: string,
  zipCode: string,
  city: string,
  country: string,
  region?: string,
  phoneNumber: string,
}

export interface WhishListRaw<D> {
  status: WhishListStatus,
  movieIds: string[],
  sent?: D
}
export interface WishlistDocument extends WishlistRaw<Timestamp> { }

export interface WishlistDocumentWithDates extends WishlistRaw<Date> { }


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

/** A factory function that creates an OrganizationDocument. */
export function createOrganizationDocument(
  params: Partial<OrganizationDocument> = {}
): OrganizationDocument {
  return {
    id: !!params.id ? params.id : '',
    name: '',
    email: '',
    fiscalNumber: '',
    activity: '',
    addresses: createAddresses(),
    status: OrganizationStatus.pending,
    userIds: [],
    movieIds: [],
    templateIds: [],
    created: Date.now(),
    updated: Date.now(),
    logo: PLACEHOLDER_LOGO,
    catalog: null,
    wishlist: [],
    ...params
  };
}

/** A factory function that creates Organization Addresses */
export function createAddresses(params: Partial<Addresses> = {}): Addresses {
  return {
    main: createAddress(params.main),
    ...params
  };
}

/** A factory function that creates an Address */
export function createAddress(params: Partial<Address> = {}): Address {
  return {
    street: '',
    zipCode: '',
    city: '',
    country: '',
    phoneNumber: '',
    region: '',
    ...params
  };
}