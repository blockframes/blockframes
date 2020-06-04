import { Component, ChangeDetectionStrategy, ChangeDetectorRef, OnInit, Optional } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableDataSource } from '@angular/material/table';
import { SheetTab } from '@blockframes/utils/spreadsheet';
import { Intercom } from 'ng-intercom';
import { DynamicTitleService } from '@blockframes/utils/dynamic-title/dynamic-title.service';
import { OrganizationsImportState } from '../../../import-utils';
import { AuthQuery, createUser } from '@blockframes/auth/+state';
import { createOrganization, OrganizationService } from '@blockframes/organization/+state';
import { UserService } from '@blockframes/user/+state';
import { Module } from '@blockframes/utils/apps';
import { getCodeIfExists, ExtractCode } from '@blockframes/utils/static-model/staticModels';
import { ImageUploader } from '@blockframes/utils/media/media.service';

enum SpreadSheetOrganization {
  fullDenomination,
  publicDenomination,
  email,
  logo,
  activity,
  fiscalNumber,
  street,
  city,
  zipCode,
  region,
  country,
  phoneNumber,
  superAdminEmail,
  catalogAccess,
  festivalAccess,
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
    private imageUploader: ImageUploader,
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

      // ORG ID
      // Create/retreive the org
      let org = createOrganization();
      let newOrg = true;
      if (spreadSheetRow[SpreadSheetOrganization.email]) {
        const [existingOrg] = await this.organizationService.getValue(ref => ref.where('email', '==', spreadSheetRow[SpreadSheetOrganization.email] as string));
        if (!!existingOrg) {
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
      if (spreadSheetRow[SpreadSheetOrganization.superAdminEmail]) {
        const [existingSuperAdmin] = await this.userService.getValue(ref => ref.where('email', '==', spreadSheetRow[SpreadSheetOrganization.superAdminEmail] as string));
        if (!!existingSuperAdmin) {
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

      if (spreadSheetRow[SpreadSheetOrganization.fullDenomination]) {
        /**
        * @dev We process this data only if this is for a new org
        */
        if (newOrg) {
          // SUPER ADMIN
          if (spreadSheetRow[SpreadSheetOrganization.superAdminEmail]) {
            importErrors.superAdmin.email = spreadSheetRow[SpreadSheetOrganization.superAdminEmail].trim().toLowerCase();
          }
        }

        // DENOMINATION
        if (spreadSheetRow[SpreadSheetOrganization.fullDenomination]) {
          importErrors.org.denomination.full = spreadSheetRow[SpreadSheetOrganization.fullDenomination].trim();
        }

        if (spreadSheetRow[SpreadSheetOrganization.publicDenomination]) {
          importErrors.org.denomination.public = spreadSheetRow[SpreadSheetOrganization.publicDenomination].trim();
        }

        // EMAIL
        if (spreadSheetRow[SpreadSheetOrganization.email]) {
          importErrors.org.email = spreadSheetRow[SpreadSheetOrganization.email].trim().toLowerCase();
        }

        // LOGO 
        if (spreadSheetRow[SpreadSheetOrganization.logo]) {
          org.logo = await this.imageUploader.upload(spreadSheetRow[SpreadSheetOrganization.logo]);
        }

        // ORG INFOS
        if (spreadSheetRow[SpreadSheetOrganization.activity]) {
          importErrors.org.activity = spreadSheetRow[SpreadSheetOrganization.activity];
        }

        if (spreadSheetRow[SpreadSheetOrganization.fiscalNumber]) {
          importErrors.org.fiscalNumber = spreadSheetRow[SpreadSheetOrganization.fiscalNumber];
        }

        // ADDRESS
        if (spreadSheetRow[SpreadSheetOrganization.street]) {
          importErrors.org.addresses.main.street = spreadSheetRow[SpreadSheetOrganization.street];
        }

        if (spreadSheetRow[SpreadSheetOrganization.city]) {
          importErrors.org.addresses.main.city = spreadSheetRow[SpreadSheetOrganization.city];
        }

        if (spreadSheetRow[SpreadSheetOrganization.zipCode]) {
          importErrors.org.addresses.main.zipCode = spreadSheetRow[SpreadSheetOrganization.zipCode];
        }

        if (spreadSheetRow[SpreadSheetOrganization.region]) {
          importErrors.org.addresses.main.region = spreadSheetRow[SpreadSheetOrganization.region];
        }

        if (spreadSheetRow[SpreadSheetOrganization.country]) {
          const country = getCodeIfExists('TERRITORIES', spreadSheetRow[SpreadSheetOrganization.country] as ExtractCode<'TERRITORIES'>);
              if (country) {
                importErrors.org.addresses.main.country = country;
              } else {
                importErrors.errors.push({
                  type: 'warning',
                  field: 'addresses.main.country',
                  name: 'Country',
                  reason: `${spreadSheetRow[SpreadSheetOrganization.country]} not found in territories list`,
                  hint: 'Edit corresponding sheet field.'
                });
              }
          
        }

        if (spreadSheetRow[SpreadSheetOrganization.phoneNumber]) {
          importErrors.org.addresses.main.phoneNumber = spreadSheetRow[SpreadSheetOrganization.phoneNumber];
        }

        // APP ACCESS
        if (spreadSheetRow[SpreadSheetOrganization.catalogAccess]) {
          const [module1, module2]: Module[] = spreadSheetRow[SpreadSheetOrganization.catalogAccess].split(this.separator).map(m => m.trim().toLowerCase());
          if (module1) {
            importErrors.org.appAccess.catalog[module1] = true;
          }
          if (module2) {
            importErrors.org.appAccess.catalog[module2] = true;
          }
        }

        if (spreadSheetRow[SpreadSheetOrganization.festivalAccess]) {
          const [module1, module2]: Module[] = spreadSheetRow[SpreadSheetOrganization.festivalAccess].split(this.separator).map(m => m.trim().toLowerCase());
          if (module1) {
            importErrors.org.appAccess.festival[module1] = true;
          }
          if (module2) {
            importErrors.org.appAccess.festival[module2] = true;
          }
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
        type: 'error',
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

    // ACTIVITY
    if (!organization.activity) {
      errors.push({
        type: 'warning',
        field: 'organization.activity',
        name: 'Activity',
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
