
import { AngularFirestore } from '@angular/fire/firestore';

import { createUser } from '@blockframes/auth/+state';
import { UserService } from '@blockframes/user/+state';
import { Territory } from '@blockframes/utils/static-model';
import { getKeyIfExists } from '@blockframes/utils/helpers';
import { Module, ModuleAccess, modules } from '@blockframes/utils/apps';
import { extract, ExtractConfig, SheetTab, ValueWithWarning } from '@blockframes/utils/spreadsheet';
import { createOrganization, Organization, OrganizationService } from '@blockframes/organization/+state';
import { getOrgId, getUserId, OrganizationsImportState, SpreadsheetImportError } from '@blockframes/import/utils';


const errorMap = {
  'no-denomination-full': JSON.stringify({
    type: 'error',
    field: 'org.denomination.full',
    name: 'No organization name',
    reason: 'Mandatory field is missing.',
    hint: 'Please fill in the corresponding sheet field.',
  }),
  'full-denomination-already-taken': JSON.stringify({
    type: 'error',
    field: 'org.denomination.full',
    name: 'Organization name already taken',
    reason: 'There is already an organization with this name.',
    hint: 'Please edit the corresponding sheet field.',
  }),
  'public-denomination-already-taken': JSON.stringify({
    type: 'error',
    field: 'org.denomination.public',
    name: 'Organization name already taken',
    reason: 'There is already an organization with this name.',
    hint: 'Please edit the corresponding sheet field.',
  }),
  'no-contact-email': JSON.stringify({
    type: 'error',
    field: 'org.email',
    name: 'No contact email',
    reason: 'Mandatory field is missing.',
    hint: 'Please fill in the corresponding sheet field.',
  }),
  'no-admin-email': JSON.stringify({
    type: 'error',
    field: 'superAdmin.email',
    name: 'No admin email',
    reason: 'Mandatory field is missing.',
    hint: 'Please fill in the corresponding sheet field.',
  }),
  'admin-email-taken': JSON.stringify({
    type: 'error',
    field: 'superAdmin.email',
    name: 'Admin email already exist',
    reason: 'To create a new admin user you should provide a new email.',
    hint: 'This email already exist in the app. Please edit the corresponding sheet field.',
  }),
  'unknown-activity': JSON.stringify({
    type: 'error',
    field: 'org.activity',
    name: 'Unknown Activity',
    reason: `The value you provided cannot be found in the known activity list.`,
    hint: 'Edit corresponding sheet field.'
  }),
  'unknown-country': JSON.stringify({
    type: 'error',
    field: 'org.address.main.country',
    name: 'Unknown Country',
    reason: `The value you provided cannot be found in the known country list.`,
    hint: 'Edit corresponding sheet field.'
  }),
  'unknown-catalog-module': JSON.stringify({
    type: 'error',
    field: 'org.appAccess.catalog',
    name: 'Unknown Catalog access',
    reason: `The value you provided must be a list of known values ("dashboard"/"marketplace").`,
    hint: 'Edit corresponding sheet field.'
  }),
  'unknown-festival-module': JSON.stringify({
    type: 'error',
    field: 'org.appAccess.festival',
    name: 'Unknown Festival access',
    reason: `The value you provided must be a list of known values ("dashboard"/"marketplace").`,
    hint: 'Edit corresponding sheet field.'
  }),
  'unknown-financiers-module': JSON.stringify({
    type: 'error',
    field: 'org.appAccess.financiers',
    name: 'Unknown Financiers access',
    reason: `The value you provided must be a list of known values ("dashboard"/"marketplace").`,
    hint: 'Edit corresponding sheet field.'
  }),
};

const warningMap: Record<string, SpreadsheetImportError> = {
  'no-activity': {
    type: 'warning',
    field: 'org.activity',
    name: 'No Activity',
    reason: 'Optional field is missing',
    hint: 'Edit corresponding sheet field.'
  },
  'no-denomination-public': {
    type: 'warning',
    field: 'org.denomination.public',
    name: 'No public name',
    reason: 'Optional field is missing, The full name will be used instead.',
    hint: 'Edit corresponding sheet field if you want to set a different public name.'
  },
  'no-fiscal-number': {
    type: 'warning',
    field: 'org.fiscalNumber',
    name: 'No fiscal number',
    reason: 'Optional field is missing.',
    hint: 'Edit corresponding sheet field.'
  },
  'no-address-street': {
    type: 'warning',
    field: 'org.address.main.street',
    name: 'No street',
    reason: 'Optional field is missing.',
    hint: 'Edit corresponding sheet field.'
  },
  'no-address-city': {
    type: 'warning',
    field: 'org.address.main.city',
    name: 'No city',
    reason: 'Optional field is missing.',
    hint: 'Edit corresponding sheet field.'
  },
  'no-address-zip-code': {
    type: 'warning',
    field: 'org.address.main.zipCode',
    name: 'No zip code',
    reason: 'Optional field is missing.',
    hint: 'Edit corresponding sheet field.'
  },
  'no-address-region': {
    type: 'warning',
    field: 'org.address.main.region',
    name: 'No region',
    reason: 'Optional field is missing.',
    hint: 'Edit corresponding sheet field.'
  },
  'no-address-country': {
    type: 'warning',
    field: 'org.address.main.country',
    name: 'No country',
    reason: 'Optional field is missing.',
    hint: 'Edit corresponding sheet field.'
  },
  'no-address-phone-number': {
    type: 'warning',
    field: 'org.address.main.phoneNumber',
    name: 'No phone number',
    reason: 'Optional field is missing.',
    hint: 'Edit corresponding sheet field.'
  },
};

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

function formatAccess(value: string, errorCode: keyof typeof errorMap) {
  const rawModules = value.split(separator).map(m => m.trim().toLowerCase()) as Module[];
  const wrongValue = rawModules.some(module => !modules.includes(module));
  if (wrongValue) throw new Error(errorMap[errorCode]);
  const access: Partial<ModuleAccess> = {};
  for (const module of modules) access[module] = false;
  for (const module of rawModules) access[module] = true;
  return access as ModuleAccess;
}

type FieldsConfigType = ExtractConfig<FieldsConfig>;


export async function formatOrg(sheetTab: SheetTab, organizationService: OrganizationService, userService: UserService, firestore: AngularFirestore) {

  const orgs: OrganizationsImportState[] = [];

  // Cache to avoid  querying db every time
  const orgNameCache: Record<string, string> = {};
  const userNameCache: Record<string, string> = {};

  // ! The order of the property should be the same as excel columns
  const fieldsConfig: FieldsConfigType = {
    /* a */ 'org.denomination.full': async (value: string) => {
      const trimmed = value.trim();
      if (!trimmed) throw new Error(errorMap['no-denomination-full']);
      const exist = await getOrgId(trimmed, organizationService, orgNameCache);
      if (exist) throw new Error(errorMap['full-denomination-already-taken']);
      return trimmed
    },
    /* b */ 'org.denomination.public': async (value: string, data: Partial<FieldsConfig>) => {
      const trimmed = value.trim();
      if (!trimmed) return new ValueWithWarning(data.org.denomination.full ?? '', warningMap['no-denomination-public']);
      const exist = await getOrgId(trimmed, organizationService, orgNameCache);
      if (exist) throw new Error(errorMap['public-denomination-already-taken']);
      return trimmed;
    },
    /* c */ 'org.email': async (value: string) => {
      const trimmed = value.trim().toLowerCase();
      if (!trimmed) throw new Error(errorMap['no-contact-email']);
      return trimmed;
    },
    /* d */ 'org.activity': (value: string) => {
      if (!value) return new ValueWithWarning(value, warningMap['no-activity']);
      const activity = getKeyIfExists('orgActivity', value);
      if (!activity) throw new Error(errorMap['unknown-activity']);
      return activity;
    },
    /* e */ 'org.fiscalNumber': (value: string) => {
      if (!value) return new ValueWithWarning(value, warningMap['no-fiscal-number']);
      return value;
    },
    /* f */ 'org.addresses.main.street': (value: string) => {
      if (!value) return new ValueWithWarning(value, warningMap['no-address-street']);
      return value;
    },
    /* g */ 'org.addresses.main.city': (value: string) => {
      if (!value) return new ValueWithWarning(value, warningMap['no-address-city']);
      return value;
    },
    /* h */ 'org.addresses.main.zipCode': (value: string) => {
      if (!value) return new ValueWithWarning(value, warningMap['no-address-zip-code']);
      return value;
    },
    /* i */ 'org.addresses.main.region': (value: string) => {
      if (!value) return new ValueWithWarning(value, warningMap['no-address-region']);
      return value;
    },
    /* j */ 'org.addresses.main.country': (value: string) => {
      if (!value) return new ValueWithWarning(value, warningMap['no-address-country']);
      const country = getKeyIfExists('territories', value);
      if (!country) throw new Error(errorMap['unknown-country']);
      return country;
    },
    /* k */ 'org.addresses.main.phoneNumber': (value: string) => {
      if (!value) return new ValueWithWarning(value, warningMap['no-address-phone-number']);
      return value;
    },
    /* l */ 'superAdmin.email': async (value: string) => {
      const trimmed = value.trim().toLowerCase();
      if (!trimmed) throw new Error(errorMap['no-admin-email']);

      const exist = await getUserId(trimmed, userService, userNameCache);
      if (exist) throw new Error(errorMap['admin-email-taken']);

      return trimmed;
    },
    /* m */ 'org.appAccess.catalog': (value: string) => formatAccess(value, 'unknown-catalog-module'),
    /* n */ 'org.appAccess.festival': (value: string) => formatAccess(value, 'unknown-festival-module'),
    /* o */ 'org.appAccess.financiers': (value: string) => formatAccess(value, 'unknown-financiers-module'),
  };

  const results = await extract<FieldsConfig>(sheetTab.rows, fieldsConfig);

  for (const result of results) {
    const { data, errors, warnings } = result;

    const org = createOrganization(data.org as Partial<Organization>);

    const superAdmin = createUser(data.superAdmin);

    orgs.push({ errors: [ ...errors, ...warnings ], org, superAdmin, newOrg: false });
  }

  return orgs;
}

