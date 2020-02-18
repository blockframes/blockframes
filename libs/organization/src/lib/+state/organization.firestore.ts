import { firestore } from 'firebase/app';
import { CatalogCart } from '@blockframes/organization/cart/+state/cart.model';
import { Location, BankAccount, createLocation } from '@blockframes/utils/common-interfaces/utility';
import { ImgRef, createImgRef } from '@blockframes/utils/image-uploader';

type Timestamp = firestore.Timestamp;

interface AppAccess {
  catalogDashboard: boolean;
  catalogMarketplace: boolean;
}

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
  logo: ImgRef;
  fiscalNumber: string;
  activity: string;
  wishlist: WishlistRaw<D>[];
  cart: CatalogCart[];
  isBlockchainEnabled: boolean;
  bankAccounts: BankAccount[];
  appAccess?: AppAccess;
}

export interface OrganizationDocument extends OrganizationRaw<Timestamp> { }

export interface OrganizationDocumentWithDates extends OrganizationRaw<Date> { }

/** Status of an Organization, set to pending by default when an Organization is created. */
export enum OrganizationStatus {
  pending = 'pending',
  accepted = 'accepted'
}

export interface AddressSet {
  main: Location;
  billing?: Location;
  office?: Location;
  // Other can be added here
}

export interface WishlistRaw<D> {
  status: WishlistStatus;
  movieIds: string[];
  sent?: D;
  name?: string;
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
  } as OrganizationDocument;
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
    logo: createImgRef(),
    wishlist: [],
    cart: [],
    isBlockchainEnabled: false,
    bankAccounts: [],
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
