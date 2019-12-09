
import { firestore } from "firebase/app";

type Timestamp = firestore.Timestamp;


/** Document model of an Organization */
interface OrganizationRaw<D> {
  id: string;
  name: string;
  addresses: AddressSet;
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
  isBlockchainEnabled: boolean;
}

export interface OrganizationDocument extends OrganizationRaw<Timestamp> {}

export interface OrganizationDocumentWithDates extends OrganizationRaw<Date> {}

/** Status of an Organization, set to pending by default when an Organization is created. */
export const enum OrganizationStatus {
  pending = 'pending',
  accepted = 'accepted'
}

export interface AddressSet {
  main: Location,
  billing?: Location,
  office?: Location,
  // Other can be added here
}

export interface Location {
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
  return {
    ...org,
    created: firestore.Timestamp.now(),
    updated: firestore.Timestamp.now()
  } as OrganizationDocument
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
    addresses: createAddressSet(),
    status: OrganizationStatus.pending,
    userIds: [],
    movieIds: [],
    templateIds: [],
    created: new Date(),
    updated: new Date(),
    logo: PLACEHOLDER_LOGO,
    wishlist: [],
    isBlockchainEnabled: false,
    ...params
  };
}

/** A factory function that creates Organization AddressSet */
export function createAddressSet(params: Partial<AddressSet> = {}): AddressSet {
  return {
    main: createLocation(params.main),
    ...params
  };
}

/** A factory function that creates an Address/Location */
export function createLocation(params: Partial<Location> = {}): Location {
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
