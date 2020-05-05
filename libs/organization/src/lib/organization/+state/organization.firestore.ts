import { firestore } from 'firebase/app';
import { CatalogCart } from '@blockframes/cart/+state/cart.model';
import { Location, BankAccount, createLocation } from '@blockframes/utils/common-interfaces/utility';
import { ImgRef, createImgRef } from '@blockframes/utils/image-uploader';
import { OrgAppAccess, createOrgAppAccess } from '@blockframes/utils/apps';


type Timestamp = firestore.Timestamp;

interface Denomination {
  full: string;
  public?: string;
}

/** Document model of an Organization */
interface OrganizationBase<D> {
  id: string;
  activity: OrgActivity;
  addresses: AddressSet;
  appAccess: OrgAppAccess;
  bankAccounts?: BankAccount[]; // @TODO (#2692)
  cart: CatalogCart[];
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
  wishlist: WishlistBase<D>[];
}

export const activities = {
  production: 'Production',
  intlSales: 'International Sales',
  distribution: 'Distribution',
  tvBroadcast: 'Television Broadcast',
  vodPlatform: 'VOD Platform',
  theatricalExhibition: 'Theatrical Exhibition',
  buyersRep: 'Buyer\'s Rep',
  filmFestival: 'Film Festival',
  filmFund: 'Film Fund',
  filmLibrary: 'Film Library',
  filmCommission: 'Film Commission',
  financialInstitution: 'Financial Institution',
  press: 'Press',
} as const;

type OrgActivity = keyof typeof activities | '';

export interface OrganizationDocument extends OrganizationBase<Timestamp> { }

export interface OrganizationDocumentWithDates extends OrganizationBase<Date> { }

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

export interface WishlistBase<D> {
  status: WishlistStatus;
  movieIds: string[];
  sent?: D;
  name?: string;
}
export interface WishlistDocument extends WishlistBase<Timestamp> { }

export interface WishlistDocumentWithDates extends WishlistBase<Date> { }

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
  const org = createOrganizationBase(params);
  return {
    ...org,
    created: firestore.Timestamp.now(),
    updated: firestore.Timestamp.now()
  } as OrganizationDocument;
}

/** A factory function that creates an OrganizationDocument. */
export function createOrganizationBase(
  params: Partial<OrganizationBase<Timestamp | Date>> = {}
): OrganizationBase<Timestamp | Date> {
  return {
    id: !!params.id ? params.id : '',
    activity: '',
    bankAccounts: [],
    cart: [],
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
    appAccess: createOrgAppAccess(params.appAccess),
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
