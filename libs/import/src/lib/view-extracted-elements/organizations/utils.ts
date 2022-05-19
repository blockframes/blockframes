import { getKeyIfExists } from '@blockframes/utils/helpers';
import { UserService } from '@blockframes/user/+state';
import { createUser, User, createOrganization, Organization, Territory, Module, ModuleAccess, modules } from '@blockframes/model';
import { extract, ExtractConfig, SheetTab } from '@blockframes/utils/spreadsheet';
import { OrganizationService } from '@blockframes/organization/+state';
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
    name: string;
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
  if (wrongValue) throw wrongValueError<string>(value, name);
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
    /* a */ 'org.name': async (value: string) => {
      if (!value) throw mandatoryError(value, 'Organization Name');
      const exist = await getOrgId(value, organizationService, orgNameCache);
      if (exist) throw alreadyExistError(value, 'Organization Name');
      return value
    },
    /* b */ 'org.email': async (value: string) => {
      const lower = value.toLowerCase();
      if (!lower) throw mandatoryError(value, 'Contract Email');
      return lower;
    },
    /* c */ 'org.activity': (value: string) => {
      if (!value) throw optionalWarning('Activity');
      const activity = getKeyIfExists('orgActivity', value);
      if (!activity) throw wrongValueError(value, 'Activity');
      return activity;
    },
    /* d */ 'org.fiscalNumber': (value: string) => {
      if (!value) throw optionalWarning('Fiscal Number');
      return value;
    },
    /* e */ 'org.addresses.main.street': (value: string) => {
      if (!value) throw optionalWarning('Fiscal Number');
      return value;
    },
    /* f */ 'org.addresses.main.city': (value: string) => {
      if (!value) throw optionalWarning('City');
      return value;
    },
    /* g */ 'org.addresses.main.zipCode': (value: string) => {
      if (!value) throw optionalWarning('Zip Code');
      return value;
    },
    /* h */ 'org.addresses.main.region': (value: string) => {
      if (!value) throw optionalWarning('Region');
      return value;
    },
    /* i */ 'org.addresses.main.country': (value: string) => {
      if (!value) return optionalWarning('Country');
      const country = getKeyIfExists('territories', value) as Territory;
      if (!country) throw wrongValueError(value, 'Country');
      return country as any;
    },
    /* j */ 'org.addresses.main.phoneNumber': (value: string) => {
      if (!value) throw optionalWarning('Phone Number');
      return value;
    },
    /* k */ 'superAdmin.email': async (value: string) => {
      const lower = value.toLowerCase();
      if (!lower) throw mandatoryError(value, 'Admin Email');

      const exist = await getUser({ email: lower }, userService, userCache);
      if (exist) throw alreadyExistError(value, 'Admin Email');

      return lower;
    },
    /* l */ 'org.appAccess.catalog': (value: string) => formatAccess(value, 'Catalog Access'),
    /* m */ 'org.appAccess.festival': (value: string) => formatAccess(value, 'Festival Access'),
    /* n */ 'org.appAccess.financiers': (value: string) => formatAccess(value, 'Financiers Access'),
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

