import { Component, ChangeDetectionStrategy, ChangeDetectorRef, OnInit, Optional } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableDataSource } from '@angular/material/table';
import { extract, ExtractConfig, SheetTab, ValueWithWarning } from '@blockframes/utils/spreadsheet';
import { Intercom } from 'ng-intercom';
import { DynamicTitleService } from '@blockframes/utils/dynamic-title/dynamic-title.service';
import { OrganizationsImportState, SpreadsheetImportError } from '../../../import-utils';
import { AuthQuery, createUser } from '@blockframes/auth/+state';
import { createOrganization, OrganizationService } from '@blockframes/organization/+state';
import { UserService } from '@blockframes/user/+state';
import { getOrgModuleAccess, Module } from '@blockframes/utils/apps';
import { getKeyIfExists } from '@blockframes/utils/helpers';
import { Territory } from '@blockframes/utils/static-model';

const separator = ',';

interface FieldsConfig {
  denomination: {
    full: string,
    public: string
  },
  email: string,
  org: {
    activity: any,
    fiscalNumber: string,
    addresses: {
      main: {
        street: string,
        city: string,
        zipCode: string,
        region: string,
        country: Territory,
        phoneNumber: string,
      }
    }
  },
  superAdminEmail: string,
  catalogAccess: Module[],
  festivalAccess: Module[],
  financiersAccess: Module[],
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


@Component({
  selector: 'import-view-extracted-organizations',
  templateUrl: './view-extracted-organizations.component.html',
  styleUrls: ['./view-extracted-organizations.component.scss'],
  changeDetection: ChangeDetectionStrategy.Default
})
export class ViewExtractedOrganizationsComponent implements OnInit {

  public orgsToUpdate = new MatTableDataSource<OrganizationsImportState>();
  public orgsToCreate = new MatTableDataSource<OrganizationsImportState>();
  public isUserBlockframesAdmin = false;

  constructor(
    @Optional() private intercom: Intercom,
    private snackBar: MatSnackBar,
    private organizationService: OrganizationService,
    private userService: UserService,
    // private imageUploader: ImageUploader,
    private cdRef: ChangeDetectorRef,
    private authQuery: AuthQuery,
    private dynTitle: DynamicTitleService
  ) {
    this.dynTitle.setPageTitle('Import organizations')
  }

  ngOnInit() {
    this.isUserBlockframesAdmin = this.authQuery.isBlockframesAdmin;
    this.cdRef.markForCheck();
  }

  public async format(sheetTab: SheetTab) {
    this.clearDataSources();
    const matSnackbarRef = this.snackBar.open('Loading... Please wait', 'close');
    for (const spreadSheetRow of sheetTab.rows) {

      const { data, errors, warnings, } = extract<FieldsConfig>([spreadSheetRow], fieldsConfig);
      console.log({ data, errors, warnings })
      // ORG ID
      // Create/retreive the org
      let org = createOrganization();
      let newOrg = true;
      if (data.email) {
        const [existingOrg] = await this.organizationService.getValue(ref => ref.where('email', '==', data.email));
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
        const [existingSuperAdmin] = await this.userService.getValue(ref => ref.where('email', '==', data.superAdminEmail));
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


        const orgWithErrors = await this.validate(importErrors);

        if (!orgWithErrors.newOrg) {
          this.orgsToUpdate.data.push(orgWithErrors);
          this.orgsToUpdate.data = [... this.orgsToUpdate.data];
        } else {
          orgWithErrors.org.id = this.organizationService['db'].createId();
          this.orgsToCreate.data.push(orgWithErrors);
          this.orgsToCreate.data = [... this.orgsToCreate.data];
        }

        this.cdRef.markForCheck();

      }
    }
    matSnackbarRef.dismissWithAction(); // loading ended
  }

  private async validate(importErrors: OrganizationsImportState): Promise<OrganizationsImportState> {

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


  public openIntercom(): void {
    return this.intercom.show();
  }

  private clearDataSources() {
    this.orgsToCreate.data = [];
    this.orgsToUpdate.data = [];
  }
}
