import { firestore } from 'firebase/app';
import { CatalogCart } from '@blockframes/organization/cart/+state/cart.model';
import { Location, BankAccount, createLocation } from '@blockframes/utils/common-interfaces/utility';
import { ImgRef, createImgRef } from '@blockframes/utils/image-uploader';

type Timestamp = firestore.Timestamp;

interface AppAccess {
  catalogDashboard: boolean;
  catalogMarketplace: boolean;
}

interface Denomination {
  full: string;
  public?: string;
}

/** Document model of an Organization */
interface OrganizationRaw<D> {
  id: string;
  activity: string;
  addresses: AddressSet;
  appAccess?: AppAccess;
  bankAccounts: BankAccount[];
  created: D;
  denomination: Denomination;
  description?: string;
  email: string;
  fiscalNumber: string;
  isBlockchainEnabled: boolean;
  logo: ImgRef;
  movieIds: string[];
  updated: D;
  userIds: string[];
  status: OrganizationStatus;
  wishlist: WishlistRaw<D>[];
}

export interface OrganizationDocument extends OrganizationRaw<Timestamp> { }

export interface OrganizationDocumentWithDates extends OrganizationRaw<Date> { }

/** Status of an Organization, set to pending by default when an Organization is created. */
export const organizationStatus = {
  pending: 'Pending',
  accepted: 'Accepted'
} as const;
export type OrganizationStatus = keyof typeof organizationStatus;

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

export type WishlistStatus = 'pending' | 'sent';

/** Default placeholder logo used when an Organization is created. */
export const PLACEHOLDER_LOGO = '/assets/logo/empty_organization.webp';

/** A public interface or Organization, without sensitive data. */
export interface PublicOrganization {
  id: string;
  denomination: Denomination;
  logo: ImgRef;
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
    activity: '',
    bankAccounts: [],
    created: new Date(),
    description: '',
    email: '',
    fiscalNumber: '',
    isBlockchainEnabled: false,
    movieIds: [],
    status: 'pending',
    updated: new Date(),
    userIds: [],
    wishlist: [],
    ...params,
    addresses: createAddressSet(params.addresses),
    denomination: createDenomination(params.denomination),
    logo: createImgRef(params.logo),
  };
}

/** A factory function that creates Organization AddressSet */
export function createAddressSet(params: Partial<AddressSet> = {}): AddressSet {
  return {
    main: createLocation(params.main),
    ...params
  };
}

/** A function that create a denomination object for Organization */
export function createDenomination(params: Partial<Denomination> = {}): Denomination {
  return {
    full: '',
    public: '',
    ...params
  }
}
