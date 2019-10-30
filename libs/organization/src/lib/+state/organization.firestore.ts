import { firestore } from "firebase/app";
type Timestamp = firestore.Timestamp;

/** Document model of an Organization */
export interface OrganizationDocument {
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
  whishList: WhishListWithDates[];
}

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

export interface WhishListDocument extends WhishListRaw<Timestamp> { }

export interface WhishListWithDates extends WhishListRaw<Date> { }

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

/** A factory function that creates an Organization. */
export function createOrganization(params: Partial<OrganizationDocument> = {}): OrganizationDocument {
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
    logo: '',
    catalog: null,
    whishList: [],
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