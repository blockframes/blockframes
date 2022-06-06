import { createStorageFile, StorageFile, StorageVideo } from './media';
import { DocumentMeta } from './meta';
import { Timestamp } from './timestamp';
import { getAllAppsExcept } from './apps';
import type { App, Module, ModuleAccess, OrgActivity, OrganizationStatus, OrgAppAccess, Territory } from './static';
import { app, modules } from './static';

/** A public interface or Organization, without sensitive data. */
export interface PublicOrganization {
  id: string;
  name: string;
  logo: StorageFile;
  activity?: OrgActivity
}

export interface OrgMedias {
  notes: StorageFile[],
  videos: StorageVideo[],
};

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

export interface Location {
  street: string;
  zipCode: string;
  city: string;
  country?: Territory;
  region?: string;
  phoneNumber: string;
}

/** Default placeholder logo used when an Organization is created. */
export const PLACEHOLDER_LOGO = '/assets/logo/empty_organization.svg';


/** A factory function that creates an OrganizationDocument. */
function createOrganizationBase(
  params: Partial<OrganizationBase<Timestamp | Date>> = {}
): OrganizationBase<Timestamp | Date> {
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
    name: params.name,
    logo: createStorageFile(params?.logo),
    appAccess: createOrgAppAccess(params.appAccess),
    documents: createOrgMedias(params?.documents),
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
export function createDenomination(name = '') {
  return name;
}

export function createOrgMedias(params: Partial<OrgMedias> = {}): OrgMedias {
  return {
    notes: [],
    videos: [],
    ...params
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
  financiers: { dashboard: 'Partners', marketplace: 'Investor' }
};

export interface OrganizationForm {
  name: string;
}

/** A factory function that creates an Organization. */
export function createOrganization(
  params: Partial<Organization> = {}
): Organization {
  return createOrganizationBase(params) as Organization;
}

/** Convert an organization object into a public organization */
export function createPublicOrganization(org: Partial<Organization>): PublicOrganization {
  return {
    id: org.id ?? '',
    name: org.name,
    logo: createStorageFile(org.logo),
  }
}

export function createOrgAppAccess(_appAccess: Partial<OrgAppAccess> = {}): OrgAppAccess {
  const appAccess = {} as OrgAppAccess;
  for (const a of app) {
    appAccess[a] = createModuleAccess(_appAccess[a]);
  }
  return appAccess;
}

export function createModuleAccess(moduleAccess: Partial<ModuleAccess> = {}): ModuleAccess {
  return {
    dashboard: false,
    marketplace: false,
    ...moduleAccess,
  };
}

/** A factory function that creates an Address/Location */
export function createLocation(params: Partial<Location> = {}): Location {
  return {
    street: '',
    zipCode: '',
    city: '',
    phoneNumber: '',
    region: '',
    ...params
  };
}

/**
 * Returns the apps that the org have access to
 * @param org The org to query
 * @param first The app name to return first (if present)
 * @example
 * getOrgAppAccess(orgA); // ['catalog', 'festival']
 * getOrgAppAccess(orgA, 'festival'); // ['festival', 'catalog']
 */
export function getOrgAppAccess(
  org: OrganizationDocument | OrganizationBase<Date>,
  first: App = 'festival'
): App[] {
  const apps: App[] = [];
  for (const a of app) {
    const hasAccess = modules.some((m) => !!org.appAccess[a]?.[m]);
    if (hasAccess) {
      apps.push(a);
    }
  }

  // If org have access to several app, including "first",
  // we put it in first place of the response array
  if (apps.length > 1 && apps.includes(first)) {
    return [first, ...apps.filter((a) => a !== first)];
  } else {
    return apps;
  }
}

/**
 * Returns the modules an org have access to for a particular app or for all apps
 * @param org
 * @param a
 * @example
 * // we don't know in which app the module is
 * getOrgModuleAccess(orgA); // ['dashboard', 'marketplace']
 * getOrgModuleAccess(orgB); // ['marketplace']
 */
export function getOrgModuleAccess(
  org: OrganizationDocument | OrganizationBase<Date>,
  _a?: App
): Module[] {
  const allowedModules = {} as Record<Module, boolean>;

  if (_a) {
    for (const m of modules) {
      if (org.appAccess[_a]?.[m]) {
        allowedModules[m] = true;
      }
    }
  } else {
    for (const a of app) {
      for (const m of modules) {
        if (org.appAccess[a]?.[m]) {
          allowedModules[m] = true;
        }
      }
    }
  }
  return Object.keys(allowedModules).map((k) => k as Module);
}

export function canHavePreferences(org: Organization, app: App) {
  if (app !== 'catalog' && app !== 'festival') return;
  const { marketplace, dashboard } = org.appAccess[app];
  return marketplace && !dashboard;
}