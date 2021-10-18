
import { createUser } from '@blockframes/auth/+state';
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


export async function formatOrg(sheetTab: SheetTab, organizationService: OrganizationService, userService: UserService) {

  const orgsToUpdate: OrganizationsImportState[] = [];
  const orgsToCreate: OrganizationsImportState[] = [];

  let i = 0;
  while (sheetTab.rows[i].length > 0) {
    const spreadSheetRow= sheetTab.rows[i];
    i++;

    const { data, warnings, } = extract<FieldsConfig>([spreadSheetRow], fieldsConfig);
    // ORG ID
    // Create/retrieve the org
    let org = createOrganization();
    let newOrg = true;
    if (data.email) {
      const [existingOrg] = await organizationService.getValue(ref => ref.where('email', '==', data.email));
      if (existingOrg) {
        org = existingOrg;
        newOrg = false;
      }
    }

    const importErrors = {
      org,
      newOrg,
      errors: warnings,
    } as OrganizationsImportState;

    let superAdmin = createUser();
    if (data.superAdminEmail) {
      const [existingSuperAdmin] = await userService.getValue(ref => ref.where('email', '==', data.superAdminEmail));
      if (existingSuperAdmin) {
        superAdmin = existingSuperAdmin;

        if (superAdmin.orgId) {
          if (newOrg || superAdmin.orgId !== org.id) {
            // Cannot set user as superAdmin because he already belongs to an org
            importErrors.errors.push({
              type: 'error',
              field: 'superAdmin.email',
              name: 'Super Admin email',
              reason: 'User already belongs to another org',
              hint: 'Edit corresponding sheet field.'
            });
          }
        }
      }
    }

    importErrors.superAdmin = superAdmin;

    if (data.denomination && data.denomination) {
      /**
      * @dev We process this data only if this is for a new org
      */
      if (newOrg) {
        // SUPER ADMIN
        if (data.superAdminEmail) {
          importErrors.superAdmin.email = data.superAdminEmail.trim().toLowerCase();
        }
      }

      // DENOMINATION
      if (data.denomination.full) {
        importErrors.org.denomination.full = data.denomination.full;
      }

      if (data.denomination.public) {
        importErrors.org.denomination.public = data.denomination.public;
      }

      // EMAIL
      if (data.email) {
        importErrors.org.email = data.email;
      }

      // ORG INFOS
      if (data.org) {//
        importErrors.org = {
          ...importErrors.org,
          ...data.org,
        };
      }


      // APP ACCESS
      if (data.catalogAccess) {
        const [module1, module2]: Module[] = data.catalogAccess;
        if (module1) {
          importErrors.org.appAccess.catalog[module1] = true;
        }
        if (module2) {
          importErrors.org.appAccess.catalog[module2] = true;
        }
      }

      if (data.festivalAccess) {
        const [module1, module2]: Module[] = data.festivalAccess;
        if (module1) {
          importErrors.org.appAccess.festival[module1] = true;
        }
        if (module2) {
          importErrors.org.appAccess.festival[module2] = true;
        }
      }

      if (data.financiersAccess) {
        const [module1, module2]: Module[] = data.financiersAccess;
        if (module1) {
          importErrors.org.appAccess.financiers[module1] = true;
        }
        if (module2) {
          importErrors.org.appAccess.financiers[module2] = true;
        }
      }

      if (getOrgModuleAccess(org).length === 0) {
        importErrors.errors.push({
          type: 'error',
          field: 'appAccess',
          name: 'Application access',
          reason: `You need to give access to modules for at least one app`,
          hint: 'Edit corresponding sheet field.'
        });
      }

      ///////////////
      // VALIDATION
      ///////////////


      const orgWithErrors = await validate(importErrors);

      if (!orgWithErrors.newOrg) {
        orgsToUpdate.push(orgWithErrors);
      } else {
        orgWithErrors.org.id = organizationService['db'].createId();
        orgsToCreate.push(orgWithErrors);
      }
    }
  }
  return { orgsToCreate, orgsToUpdate };
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
