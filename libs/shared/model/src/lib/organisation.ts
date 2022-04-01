import { Location, createLocation } from '@blockframes/utils/common-interfaces/utility';
import { OrgAppAccess, createOrgAppAccess, Module, App, getAllAppsExcept } from '@blockframes/utils/apps';
import type { OrgActivity, OrganizationStatus } from '@blockframes/shared/model';
import { createStorageFile, StorageFile, StorageVideo } from './media';
import { DocumentMeta } from './meta';
import { Timestamp } from './timestamp';

export interface Denomination {
  full: string;
  public?: string;
}

/** A public interface or Organization, without sensitive data. */
export interface PublicOrganization {
  id: string;
  denomination: Denomination;
  logo: StorageFile;
  activity?: OrgActivity;
}

export interface OrgMedias {
  notes: StorageFile[];
  videos: StorageVideo[];
}

/** Document model of an Organization */
export interface OrganizationBase<D> extends PublicOrganization {
  _meta?: DocumentMeta<D>;
  addresses: AddressSet;
  appAccess: OrgAppAccess;
  description?: string;
  email: string;
  fiscalNumber: string;
  userIds: string[];
  status: OrganizationStatus;
  wishlist: string[]; // An array of movieIds
  documents?: OrgMedias;
}

export type OrganizationDocument = OrganizationBase<Timestamp>;

export interface AddressSet {
  main: Location;
  billing?: Location;
  office?: Location;
  // Other can be added here
}

/** Default placeholder logo used when an Organization is created. */
export const PLACEHOLDER_LOGO = '/assets/logo/empty_organization.svg';

/** A factory function that creates an OrganizationDocument. */
function createOrganizationBase(params: Partial<OrganizationBase<Timestamp | Date>> = {}): OrganizationBase<Timestamp | Date> {
  return {
    id: params.id ? params.id : '',
    description: '',
    email: '',
    fiscalNumber: '',
    status: 'pending',
    userIds: [],
    wishlist: [],
    ...params,
    addresses: createAddressSet(params.addresses),
    denomination: createDenomination(params.denomination),
    logo: createStorageFile(params?.logo),
    appAccess: createOrgAppAccess(params.appAccess),
    documents: createOrgMedias(params?.documents),
  };
}

/** A factory function that creates Organization AddressSet */
export function createAddressSet(params: Partial<AddressSet> = {}): AddressSet {
  return {
    main: createLocation(params.main),
    ...params,
  };
}

/** A function that create a denomination object for Organization */
export function createDenomination(params: Partial<Denomination> = {}): Denomination {
  return {
    full: '',
    public: '',
    ...params,
  };
}

export function createOrgMedias(params: Partial<OrgMedias> = {}): OrgMedias {
  return {
    notes: [],
    videos: [],
    ...params,
  };
}

export function orgName(org: Partial<PublicOrganization>, type: 'public' | 'full' = 'public') {
  if (org?.denomination) {
    return org.denomination[type] || org.denomination.full;
  } else {
    return '';
  }
}

/**
 * This check if org have access to a specific module in at least one app
 * @param org
 */
export function canAccessModule(module: Module, org: OrganizationBase<unknown>, _app?: App): boolean {
  if (_app) {
    return org?.appAccess[_app]?.[module];
  } else {
    return getAllAppsExcept(['crm']).some(a => org.appAccess[a]?.[module]);
  }
}

export type AppStatus = 'none' | 'requested' | 'accepted';

export type Organization = OrganizationBase<Date>;

export const organizationRoles = {
  catalog: { dashboard: 'Seller', marketplace: 'Buyer' },
  festival: { dashboard: 'Sales Agent', marketplace: 'Buyer' },
  financiers: { dashboard: 'Partners', marketplace: 'Investor' },
};

export interface OrganizationForm {
  name: string;
}

/** A factory function that creates an Organization. */
export function createOrganization(params: Partial<Organization> = {}): Organization {
  return createOrganizationBase(params) as Organization;
}

/** Convert an organization object into a public organization */
export function createPublicOrganization(org: Partial<Organization>): PublicOrganization {
  return {
    id: org.id ?? '',
    denomination: createDenomination(org.denomination),
    logo: createStorageFile(org.logo),
  };
}
