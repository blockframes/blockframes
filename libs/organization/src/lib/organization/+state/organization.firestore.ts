import { firestore } from 'firebase/app';
import { CatalogCart } from '@blockframes/cart/+state/cart.model';
import { Location, BankAccount, createLocation } from '@blockframes/utils/common-interfaces/utility';
import { OrgAppAccess, createOrgAppAccess, Module, app } from '@blockframes/utils/apps';
import { OrgActivity, OrganizationStatus } from '@blockframes/utils/static-model/types';
import { HostedMediaWithMetadata } from '@blockframes/media/+state/media.firestore';

type Timestamp = firestore.Timestamp;

interface Denomination {
  full: string;
  public?: string;
}

/** A public interface or Organization, without sensitive data. */
export interface PublicOrganization {
  id: string;
  denomination: Denomination;
  logo: string;
}

export interface OrgMedias {
  notes: HostedMediaWithMetadata[],
};

/** Document model of an Organization */
interface OrganizationBase<D> extends PublicOrganization {
  activity: OrgActivity;
  addresses: AddressSet;
  appAccess: OrgAppAccess;
  bankAccounts?: BankAccount[]; // @TODO (#2692)
  cart: CatalogCart[];
  created: D;
  description?: string;
  email: string;
  fiscalNumber: string;
  isBlockchainEnabled: boolean;
  movieIds: string[];
  updated: D;
  userIds: string[];
  status: OrganizationStatus;
  wishlist: WishlistBase<D>[];
  documents?: OrgMedias;
}

export interface OrganizationDocument extends OrganizationBase<Timestamp> { }

export interface OrganizationDocumentWithDates extends OrganizationBase<Date> { }

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
    logo: params.logo ?? '',
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

export function createOrgMedias(params: Partial<OrgMedias> = {}): OrgMedias {
  return {
    notes: [],
    ...params
  }
}

export function orgName(org: PublicOrganization, type: 'public' | 'full' = 'public') {
  return org.denomination[type] || org.denomination.full;
}

/**
 * This check if org have access to a specific module in at least one app
 * @param org
 */
export function canAccessModule(module: Module, org: OrganizationBase<any>) {
  return app.some(a => org.appAccess[a]?.[module])
}
