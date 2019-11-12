
import { firestore } from "firebase/app";
import { CatalogBasket } from "@blockframes/marketplace";
type Timestamp = firestore.Timestamp;


/** Document model of an Organization */
interface OrganizationRaw<D> {
  id: string;
  name: string;
  addresses: Addresses;
  email: string;
  created: D;
  updated: D;
  userIds: string[];
  movieIds: string[];
  templateIds: string[];
  status: OrganizationStatus;
  logo: string;
  fiscalNumber: string;
  activity: string;
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

export interface WishlistRaw<D> {
  status: WishlistStatus,
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
  const org = createOrganizationRaw(params);
  org.created = firestore.Timestamp.now();
  org.updated = firestore.Timestamp.now();
  return org as OrganizationDocument;
}

/** A factory function that creates an OrganizationDocument. */
export function createOrganizationRaw(
  params: Partial<OrganizationRaw<Timestamp | Date>> = {}
): OrganizationRaw<Timestamp | Date> {
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
    created: firestore.Timestamp.now(), // default is timestamp
    updated: firestore.Timestamp.now(), // default is timestamp
    logo: PLACEHOLDER_LOGO,
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