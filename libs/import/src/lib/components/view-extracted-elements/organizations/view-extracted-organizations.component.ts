import { Component, ChangeDetectionStrategy, ChangeDetectorRef, OnInit, Optional } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableDataSource } from '@angular/material/table';
import { extract, ParseFieldFn, SheetTab } from '@blockframes/utils/spreadsheet';
import { Intercom } from 'ng-intercom';
import { DynamicTitleService } from '@blockframes/utils/dynamic-title/dynamic-title.service';
import { OrganizationsImportState } from '../../../import-utils';
import { AuthQuery, createUser } from '@blockframes/auth/+state';
import { createOrganization, OrganizationService } from '@blockframes/organization/+state';
import { UserService } from '@blockframes/user/+state';
import { getOrgModuleAccess, Module } from '@blockframes/utils/apps';
import { getKeyIfExists } from '@blockframes/utils/helpers';

// enum SpreadSheetOrganization {
//   fullDenomination,
//   publicDenomination,
//   email,
//   activity,
//   fiscalNumber,
//   street,
//   city,
//   zipCode,
//   region,
//   country,
//   phoneNumber,
//   superAdminEmail,
//   catalogAccess,
//   festivalAccess,
//   financiersAccess,
// }

const fieldsConfig= {
  /* a */ 'fullDenomination': (value: string) => value,
  /* b */ 'publicDenomination': (value: string) => value,
  /* c */ 'email': (value: string) => value,
  /* d */ 'activity': (value: string) => value,
  /* e */ 'fiscalNumber': (value: string) => value,
  /* f */ 'street': (value: string) => value,
  /* g */ 'city': (value: string) => value,
  /* h */ 'zipCode': (value: string) => value,
  /* i */ 'region': (value: string) => value,
  /* j */ 'country': (value: string) => value,
  /* k */ 'phoneNumber': (value: string) => value,
  /* l */ 'superAdminEmail': (value: string) => value,
  /* m */ 'catalogAccess': (value: string) => value,
  /* n */ 'festivalAccess': (value: string) => value,
  /* o */ 'financiersAccess': (value: string) => value,
} as const;


type fieldsKey =  keyof typeof fieldsConfig;
type ImportType = {
  [key in fieldsKey]: ReturnType<typeof fieldsConfig[key]>
}


@Component({
  selector: 'import-view-extracted-organizations',
  templateUrl: './view-extracted-organizations.component.html',
  styleUrls: ['./view-extracted-organizations.component.scss'],
  changeDetection: ChangeDetectionStrategy.Default
})
export class ViewExtractedOrganizationsComponent implements OnInit {

  public orgsToUpdate = new MatTableDataSource<OrganizationsImportState>();
  public orgsToCreate = new MatTableDataSource<OrganizationsImportState>();
  private separator = ',';
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

      const {
        fullDenomination, publicDenomination, email,
        activity: extractedActivity, fiscalNumber, street, city, zipCode,
        region, country: extractCountry, phoneNumber, superAdminEmail,
        catalogAccess, festivalAccess, financiersAccess,
      } = extract<ImportType>([spreadSheetRow], fieldsConfig);

      // ORG ID
      // Create/retreive the org
      let org = createOrganization();
      let newOrg = true;
      if (email) {
        const [existingOrg] = await this.organizationService.getValue(ref => ref.where('email', '==', email));
        if (existingOrg) {
          org = existingOrg;
          newOrg = false;
        }
      }

      const importErrors = {
        org,
        newOrg,
        errors: [],
      } as OrganizationsImportState;

      let superAdmin = createUser();
      if (superAdminEmail) {
        const [existingSuperAdmin] = await this.userService.getValue(ref => ref.where('email', '==', superAdminEmail));
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

      if (fullDenomination) {
        /**
        * @dev We process this data only if this is for a new org
        */
        if (newOrg) {
          // SUPER ADMIN
          if (superAdminEmail) {
            importErrors.superAdmin.email = superAdminEmail.trim().toLowerCase();
          }
        }

        // DENOMINATION
        if (fullDenomination) {
          importErrors.org.denomination.full = fullDenomination.trim();
        }

        if (publicDenomination) {
          importErrors.org.denomination.public = publicDenomination.trim();
        }

        // EMAIL
        if (email) {
          importErrors.org.email = email.trim().toLowerCase();
        }

        // ORG INFOS
        if (extractedActivity) {
          const activity = getKeyIfExists('orgActivity', extractedActivity);
          if (activity) {
            importErrors.org.activity = activity;
          } else {
            importErrors.errors.push({
              type: 'warning',
              field: 'activity',
              name: 'Activity',
              reason: `${extractedActivity} not found in activity list`,
              hint: 'Edit corresponding sheet field.'
            });
          }
        } else {
          // ACTIVITY
          importErrors.errors.push({
            type: 'warning',
            field: 'organization.activity',
            name: 'Activity',
            reason: 'Optional field is missing',
            hint: 'Edit corresponding sheet field.'
          });
        }

        if (fiscalNumber) {
          importErrors.org.fiscalNumber = fiscalNumber;
        }

        // ADDRESS
        if (street) {
          importErrors.org.addresses.main.street = street;
        }

        if (city) {
          importErrors.org.addresses.main.city = city;
        }

        if (zipCode) {
          importErrors.org.addresses.main.zipCode = zipCode;
        }

        if (region) {
          importErrors.org.addresses.main.region = region;
        }

        if (extractCountry) {
          const country = getKeyIfExists('territories', extractCountry);
          if (country) {
            importErrors.org.addresses.main.country = country;
          } else {
            importErrors.errors.push({
              type: 'warning',
              field: 'addresses.main.country',
              name: 'Country',
              reason: `${extractCountry} not found in territories list`,
              hint: 'Edit corresponding sheet field.'
            });
          }

        }

        if (phoneNumber) {
          importErrors.org.addresses.main.phoneNumber = phoneNumber;
        }

        // APP ACCESS
        if (catalogAccess) {
          const [module1, module2]: Module[] = catalogAccess.split(this.separator).map(m => m.trim().toLowerCase()) as Module[];
          if (module1) {
            importErrors.org.appAccess.catalog[module1] = true;
          }
          if (module2) {
            importErrors.org.appAccess.catalog[module2] = true;
          }
        }

        if (festivalAccess) {
          const [module1, module2]: Module[] = festivalAccess.split(this.separator).map(m => m.trim().toLowerCase()) as Module[];
          if (module1) {
            importErrors.org.appAccess.festival[module1] = true;
          }
          if (module2) {
            importErrors.org.appAccess.festival[module2] = true;
          }
        }

        if (financiersAccess) {
          const [module1, module2]: Module[] = financiersAccess.split(this.separator).map(m => m.trim().toLowerCase()) as Module[];
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
      importErrors.errors.push({
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
