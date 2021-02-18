import type firebase from 'firebase';
import { CatalogCart } from '@blockframes/cart/+state/cart.model';
import { Location, BankAccount, createLocation } from '@blockframes/utils/common-interfaces/utility';
import { OrgAppAccess, createOrgAppAccess, Module, app } from '@blockframes/utils/apps';
import { OrgActivity, OrganizationStatus } from '@blockframes/utils/static-model/types';
import { HostedMediaWithMetadata } from '@blockframes/media/+state/media.firestore';
import { DocumentMeta } from '@blockframes/utils/models-meta';

type Timestamp = firebase.firestore.Timestamp;

interface Denomination {
  full: string;
  public?: string;
}

/** A public interface or Organization, without sensitive data. */
export interface PublicOrganization {
  activity?: OrgActivity
  addresses?: AddressSet;
  appAccess?: OrgAppAccess;
  denomination: Denomination;
  id: string;
  logo?: string;
}

export interface OrgMedias {
  notes: HostedMediaWithMetadata[],
};

/** Document model of an Organization */
export interface OrganizationBase<D> extends PublicOrganization {
  _meta?: DocumentMeta<D>;
  bankAccounts?: BankAccount[]; // @TODO (#2692)
  cart: CatalogCart[];
  description?: string;
  email: string;
  fiscalNumber: string;
  isBlockchainEnabled: boolean;
  userIds: string[];
  status: OrganizationStatus;
  wishlist: string[]; // An array of movieIds
  documents?: OrgMedias;
}

export interface OrganizationDocument extends OrganizationBase<Timestamp> { };

export interface AddressSet {
  main: Location;
  billing?: Location;
  office?: Location;
  // Other can be added here
}

/** Default placeholder logo used when an Organization is created. */
export const PLACEHOLDER_LOGO = '/assets/logo/empty_organization.webp';


/** A factory function that creates an OrganizationDocument. */
export function createOrganizationBase(
  params: Partial<OrganizationBase<Timestamp | Date>> = {}
): OrganizationBase<Timestamp | Date> {
  return {
    id: !!params.id ? params.id : '',
    bankAccounts: [],
    cart: [],
    description: '',
    email: '',
    fiscalNumber: '',
    isBlockchainEnabled: false,
    status: 'pending',
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
  if (!!org) {
    return org.denomination[type] || org.denomination.full;
  } else {
    return '';
  }
}

/**
 * This check if org have access to a specific module in at least one app
 * @param org
 */
export function canAccessModule(module: Module, org: OrganizationBase<any>) {
  return app.some(a => org.appAccess[a]?.[module])
}
