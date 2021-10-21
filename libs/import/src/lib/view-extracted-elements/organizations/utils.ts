
import { createUser, User } from '@blockframes/auth/+state';
import { UserService } from '@blockframes/user/+state';
import { Territory } from '@blockframes/utils/static-model';
import { getKeyIfExists } from '@blockframes/utils/helpers';
import { getOrgModuleAccess, Module } from '@blockframes/utils/apps';
import { createOrganization, OrganizationService } from '@blockframes/organization/+state';
import { OrganizationsImportState, SpreadsheetImportError } from '@blockframes/import/utils';
import { extract, ExtractConfig, SheetTab, ValueWithWarning } from '@blockframes/utils/spreadsheet';


const separator = ',';

interface FieldsConfig {
  denomination: {
    full: string;
    public: string
  };
  email: string;
  org: {
    activity: any;
    fiscalNumber: string;
    addresses: {
      main: {
        street: string;
        city: string;
        zipCode: string;
        region: string;
        country: Territory;
        phoneNumber: string;
      }
    }
  };
  superAdminEmail: string;
  catalogAccess: Module[];
  festivalAccess: Module[];
  financiersAccess: Module[];
}

type FieldsConfigType = ExtractConfig<FieldsConfig>;


export async function formatOrg(sheetTab: SheetTab, organizationService: OrganizationService, userService: UserService) {

  const orgs: OrganizationsImportState[] = [];


  const fieldsConfig: FieldsConfigType = {
    /* a */ 'denomination.full': (value: string) => value.trim(),
    /* b */ 'denomination.public': (value: string) => value.trim(),
    /* c */ 'email': (value: string) => value.trim().toLowerCase().trim(),
    /* d */ 'org.activity': (value: string) => {
      if (!value) {
        throw new Error(JSON.stringify({
          type: 'warning',
          field: 'organization.activity',
          name: 'Activity',
          reason: 'Optional field is missing',
          hint: 'Edit corresponding sheet field.'
        }))
      }
      const activity = getKeyIfExists('orgActivity', value);
      if (activity) {
        return activity;
      } else {
        const warning: SpreadsheetImportError = {
          type: 'warning',
          field: 'activity',
          name: 'Activity',
          reason: `${value} not found in activity list`,
          hint: 'Edit corresponding sheet field.'
        };
        return new ValueWithWarning(value, warning);
      }
    },
    /* e */ 'org.fiscalNumber': (value: string) => value,
    /* f */ 'org.addresses.main.street': (value: string) => value,
    /* g */ 'org.addresses.main.city': (value: string) => value,
    /* h */ 'org.addresses.main.zipCode': (value: string) => value,
    /* i */ 'org.addresses.main.region': (value: string) => value,
    /* j */ 'org.addresses.main.country': (value: string) => {
      const country = getKeyIfExists('territories', value);
      if (country) {
        return country;
      } else {
        const warning: SpreadsheetImportError = {
          type: 'warning',
          field: 'addresses.main.country',
          name: 'Country',
          reason: `${value} not found in territories list`,
          hint: 'Edit corresponding sheet field.'
        };
        return new ValueWithWarning(value, warning);
      }
    },
    /* k */ 'org.addresses.main.phoneNumber': (value: string) => value,
    /* l */ 'superAdminEmail': (value: string) => value,
    /* m */ 'catalogAccess': (value: string) => value.split(separator).map(m => m.trim().toLowerCase()) as Module[],
    /* n */ 'festivalAccess': (value: string) => value.split(separator).map(m => m.trim().toLowerCase()) as Module[],
    /* o */ 'financiersAccess': (value: string) => value.split(separator).map(m => m.trim().toLowerCase()) as Module[],
  };

  const results = await extract<FieldsConfig>(sheetTab.rows, fieldsConfig);

  for (const result of results) {
    const { data, errors, warnings } = result;

    const org = createOrganization({...data});
    // TODO issue#6929
    orgs.push({ errors,  org, superAdmin: {} as User, newOrg: false });
  }

  return orgs;
}

async function validate(importErrors: OrganizationsImportState): Promise<OrganizationsImportState> {

  const organization = importErrors.org;
  const superAdmin = importErrors.superAdmin;
  const errors = importErrors.errors;

  //////////////////
  // REQUIRED FIELDS
  //////////////////

  // EMAIL
  if (!organization.email) {
    errors.push({
      type: 'warning',
      field: 'organization.email',
      name: 'Organization email',
      reason: 'Organization email not defined',
      hint: 'Edit corresponding sheet field.'
    });
  }

  // FULL DENOMINATION
  if (!organization.denomination.full) {
    errors.push({
      type: 'error',
      field: 'organization.denomination.full',
      name: 'Full demomination',
      reason: 'Organization full denomination not defined',
      hint: 'Edit corresponding sheet field.'
    });
  }

  // SUPER ADMIN
  if (!superAdmin.email) {
    errors.push({
      type: 'error',
      field: 'superAdmin.email',
      name: 'Super admin email',
      reason: 'Org super admin email not defined',
      hint: 'Edit corresponding sheet field.'
    });
  }

  //////////////////
  // OPTIONAL FIELDS
  //////////////////

  // PUBLIC DENOMINATION
  if (!organization.denomination.public) {
    errors.push({
      type: 'warning',
      field: 'organization.denomination.public',
      name: 'Public demomination',
      reason: 'Optional field is missing',
      hint: 'Edit corresponding sheet field.'
    });
  }

  return importErrors;
}
