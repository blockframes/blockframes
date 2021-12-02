
import { createUser, User } from '@blockframes/auth/+state';
import { Territory } from '@blockframes/utils/static-model';
import { getKeyIfExists } from '@blockframes/utils/helpers';
import { UserService } from '@blockframes/user/+state';
import { Module, ModuleAccess, modules } from '@blockframes/utils/apps';
import { extract, ExtractConfig, SheetTab } from '@blockframes/utils/spreadsheet';
import { createOrganization, Organization, OrganizationService } from '@blockframes/organization/+state';
import { alreadyExistError, getOrgId, getUser, mandatoryError, optionalWarning, OrganizationsImportState, wrongValueError } from '@blockframes/import/utils';

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

type ModuleOrUndefined = Module | '';
function formatAccess(value: string, name: string) {
  const rawModules = value.split(separator).map(m => m.trim().toLowerCase()) as ModuleOrUndefined[];
  const wrongValue = rawModules.some(module => ![...modules, ''].includes(module));
  if (wrongValue) return wrongValueError<ModuleAccess>(name);
  const access: Partial<ModuleAccess> = {};
  for (const module of modules) access[module] = false;
  for (const module of rawModules) if (module !== '') access[module] = true;
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
      if (!value) return mandatoryError('Organization Name');
      const exist = await getOrgId(value, organizationService, orgNameCache);
      if (exist) return alreadyExistError('Organization Name');
      return value
    },
    /* b */ 'org.denomination.public': async (value: string, data: Partial<FieldsConfig>) => {
      if (!value) return optionalWarning('Organization Public Name', data.org.denomination.full);
      const exist = await getOrgId(value, organizationService, orgNameCache);
      if (exist) return alreadyExistError('Organization Public Name');
      return value;
    },
    /* c */ 'org.email': async (value: string) => {
      const lower = value.toLowerCase();
      if (!lower) return mandatoryError('Contract Email');
      return lower;
    },
    /* d */ 'org.activity': (value: string) => {
      if (!value) return optionalWarning('Activity');
      const activity = getKeyIfExists('orgActivity', value);
      if (!activity) return wrongValueError('Activity');
      return activity;
    },
    /* e */ 'org.fiscalNumber': (value: string) => {
      if (!value) return optionalWarning('Fiscal Number');
      return value;
    },
    /* f */ 'org.addresses.main.street': (value: string) => {
      if (!value) return optionalWarning('Fiscal Number');
      return value;
    },
    /* g */ 'org.addresses.main.city': (value: string) => {
      if (!value) return optionalWarning('City');
      return value;
    },
    /* h */ 'org.addresses.main.zipCode': (value: string) => {
      if (!value) return optionalWarning('Zip Code');
      return value;
    },
    /* i */ 'org.addresses.main.region': (value: string) => {
      if (!value) return optionalWarning('Region');
      return value;
    },
    /* j */ 'org.addresses.main.country': (value: string) => {
      if (!value) return optionalWarning('Country');
      const country = getKeyIfExists('territories', value) as Territory;
      if (!country) return wrongValueError('Country');
      return country as any;
    },
    /* k */ 'org.addresses.main.phoneNumber': (value: string) => {
      if (!value) return optionalWarning('Phone Number');
      return value;
    },
    /* l */ 'superAdmin.email': async (value: string) => {
      const lower = value.toLowerCase();
      if (!lower) return mandatoryError('Admin Email');

      const exist = await getUser({ email: lower }, userService, userCache);
      if (exist) return alreadyExistError('Admin Email');

      return lower;
    },
    /* m */ 'org.appAccess.catalog': (value: string) => formatAccess(value, 'Catalog Access'),
    /* n */ 'org.appAccess.festival': (value: string) => formatAccess(value, 'Festival Access'),
    /* o */ 'org.appAccess.financiers': (value: string) => formatAccess(value, 'Financiers Access'),
  };

  const results = await extract<FieldsConfig>(sheetTab.rows, fieldsConfig);

  for (const result of results) {
    const { data, errors } = result;

    const org = createOrganization(data.org as Partial<Organization>);
    org.status = 'accepted';

    const superAdmin = createUser(data.superAdmin);

    orgs.push({ errors, org, superAdmin, newOrg: true });
  }

  return orgs;
}

