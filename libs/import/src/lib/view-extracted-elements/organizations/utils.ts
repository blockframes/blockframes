
import { createUser, User } from '@blockframes/auth/+state';
import { Territory } from '@blockframes/utils/static-model';
import { getKeyIfExists } from '@blockframes/utils/helpers';
import { UserService } from '@blockframes/user/+state';
import { Module, ModuleAccess, modules } from '@blockframes/utils/apps';
import { extract, ExtractConfig, SheetTab, ValueWithWarning } from '@blockframes/utils/spreadsheet';
import { createOrganization, Organization, OrganizationService } from '@blockframes/organization/+state';
import { AlreadyExistError, getOrgId, getUser, MandatoryError, optionalWarning, OrganizationsImportState, WrongValueError } from '@blockframes/import/utils';

const separator = ',';

interface FieldsConfig {
  org: {
    activity: string;
    addresses: {
      main: {
        city: string;
        country: Territory;
        phoneNumber: string;
        region: string;
        street: string;
        zipCode: string;
      }
    };
    appAccess: {
      catalog: ModuleAccess;
      festival: ModuleAccess;
      financiers: ModuleAccess;
    };
    denomination: {
      full: string;
      public: string
    };
    email: string;
    fiscalNumber: string;
    userIds: string[];
  };
  superAdmin: {
    email: string;
  };
}

function formatAccess(value: string, errorData: { field: string, name: string }) {
  const rawModules = value.split(separator).map(m => m.trim().toLowerCase()) as Module[];
  const wrongValue = rawModules.some(module => !modules.includes(module));
  if (wrongValue) throw new WrongValueError(errorData);
  const access: Partial<ModuleAccess> = {};
  for (const module of modules) access[module] = false;
  for (const module of rawModules) access[module] = true;
  return access as ModuleAccess;
}

type FieldsConfigType = ExtractConfig<FieldsConfig>;

export async function formatOrg(sheetTab: SheetTab, organizationService: OrganizationService, userService: UserService) {

  const orgs: OrganizationsImportState[] = [];

  // Cache to avoid  querying db every time
  const orgNameCache: Record<string, string> = {};
  const userCache: Record<string, User> = {};

  // ! The order of the property should be the same as excel columns
  const fieldsConfig: FieldsConfigType = {
    /* a */ 'org.denomination.full': async (value: string) => {
      if (!value) throw new MandatoryError({ field: 'org.denomination.full', name: 'Organization Name' });
      const exist = await getOrgId(value, organizationService, orgNameCache);
      if (exist) throw new AlreadyExistError({ field: 'org.denomination.full', name: 'Organization Name' });
      return value
    },
    /* b */ 'org.denomination.public': async (value: string, data: Partial<FieldsConfig>) => {
      if (!value) return new ValueWithWarning(data.org.denomination.full ?? '', optionalWarning({ field: 'org.denomination.public', name: 'Organization Public Name' }));
      const exist = await getOrgId(value, organizationService, orgNameCache);
      if (exist) throw new AlreadyExistError({ field: 'org.denomination.public', name: 'Organization Public Name' });
      return value;
    },
    /* c */ 'org.email': async (value: string) => {
      const lower = value.toLowerCase();
      if (!lower) throw new MandatoryError({ field: 'org.email', name: 'Contract Email' });
      return lower;
    },
    /* d */ 'org.activity': (value: string) => {
      if (!value) return new ValueWithWarning(value, optionalWarning({ field: 'org.activity', name: 'Activity' }));
      const activity = getKeyIfExists('orgActivity', value);
      if (!activity) throw new WrongValueError({ field: 'org.activity', name: 'Activity' });
      return activity;
    },
    /* e */ 'org.fiscalNumber': (value: string) => {
      if (!value) return new ValueWithWarning(value, optionalWarning({ field: 'org.fiscalNumber', name: 'Fiscal Number' }));
      return value;
    },
    /* f */ 'org.addresses.main.street': (value: string) => {
      if (!value) return new ValueWithWarning(value, optionalWarning({ field: 'org.address.main.street', name: 'Fiscal Number' }));
      return value;
    },
    /* g */ 'org.addresses.main.city': (value: string) => {
      if (!value) return new ValueWithWarning(value, optionalWarning({ field: 'org.address.main.city', name: 'City' }));
      return value;
    },
    /* h */ 'org.addresses.main.zipCode': (value: string) => {
      if (!value) return new ValueWithWarning(value, optionalWarning({ field: 'org.address.main.zipCode', name: 'Zip Code' }));
      return value;
    },
    /* i */ 'org.addresses.main.region': (value: string) => {
      if (!value) return new ValueWithWarning(value, optionalWarning({ field: 'org.address.main.region', name: 'Region' }));
      return value;
    },
    /* j */ 'org.addresses.main.country': (value: string) => {
      if (!value) return new ValueWithWarning(value, optionalWarning({ field: 'org.address.main.country', name: 'Country' }));
      const country = getKeyIfExists('territories', value) as Territory;
      if (!country) throw new WrongValueError({ field: 'org.addresses.main.country', name: 'Country' });
      return country as any;
    },
    /* k */ 'org.addresses.main.phoneNumber': (value: string) => {
      if (!value) return new ValueWithWarning(value, optionalWarning({ field: 'org.address.main.phoneNumber', name: 'Phone Number' }));
      return value;
    },
    /* l */ 'superAdmin.email': async (value: string) => {
      const lower = value.toLowerCase();
      if (!lower) throw new MandatoryError({ field: 'superAdmin.email', name: 'Admin Email' });

      const exist = await getUser({ email: lower}, userService, userCache);
      if (exist) throw new AlreadyExistError({ field: 'superAdmin.email', name: 'Admin Email' });

      return lower;
    },
    /* m */ 'org.appAccess.catalog': (value: string) => formatAccess(value, { field: 'org.appAccess.catalog', name: 'Catalog Access' }),
    /* n */ 'org.appAccess.festival': (value: string) => formatAccess(value, { field: 'org.appAccess.festival', name: 'Festival Access' }),
    /* o */ 'org.appAccess.financiers': (value: string) => formatAccess(value, { field: 'org.appAccess.financiers', name: 'Financiers Access' }),
  };

  const results = await extract<FieldsConfig>(sheetTab.rows, fieldsConfig);

  for (const result of results) {
    const { data, errors, warnings } = result;

    const org = createOrganization(data.org as Partial<Organization>);
    org.status = 'accepted';

    const superAdmin = createUser(data.superAdmin);

    orgs.push({ errors: [ ...errors, ...warnings ], org, superAdmin, newOrg: true });
  }

  return orgs;
}

