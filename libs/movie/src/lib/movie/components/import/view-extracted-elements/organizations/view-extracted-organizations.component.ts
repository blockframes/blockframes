import { Component, ChangeDetectionStrategy, ChangeDetectorRef, OnInit, Optional, ApplicationModule } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableDataSource } from '@angular/material/table';
import { SheetTab } from '@blockframes/utils/spreadsheet';
import { Intercom } from 'ng-intercom';
import { DynamicTitleService } from '@blockframes/utils/dynamic-title/dynamic-title.service';
import { OrganizationsImportState } from '../../import-utils';
import { AuthQuery, createUser } from '@blockframes/auth/+state';
import { createOrganization, OrganizationService } from '@blockframes/organization/+state';
import { UserService } from '@blockframes/user/+state';
import { Module } from '@blockframes/utils/apps';

enum SpreadSheetOrganization {
  fullDenomination,
  publicDenomination,
  orgEmail,
  superAdminEmail,
  catalogAccess,
  festivalAccess,
}

// @TODO (#2920) move the import folder
@Component({
  selector: 'movie-view-extracted-organizations',
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
      if (spreadSheetRow[SpreadSheetOrganization.orgEmail]) {
        const [existingOrg] = await this.organizationService.getValue(ref => ref.where('email', '==', spreadSheetRow[SpreadSheetOrganization.orgEmail] as string));
        if (!!existingOrg) {
          org = existingOrg;
          newOrg = false;
        }
      }

      let superAdmin = createUser();
      if (spreadSheetRow[SpreadSheetOrganization.superAdminEmail]) {
        const [existingSuperAdmin] = await this.userService.getValue(ref => ref.where('email', '==', spreadSheetRow[SpreadSheetOrganization.superAdminEmail] as string));
        if (!!existingSuperAdmin) {
          superAdmin = existingSuperAdmin;
        }
      }

      const importErrors = {
        org,
        newOrg,
        superAdmin,
        errors: [],
      } as OrganizationsImportState;

      if (spreadSheetRow[SpreadSheetOrganization.fullDenomination]) {
        /**
        * @dev We process this data only if this is for a new org
        */
        if (newOrg) {

          // DENOMINATION
          if (spreadSheetRow[SpreadSheetOrganization.fullDenomination]) {
            importErrors.org.denomination.full = spreadSheetRow[SpreadSheetOrganization.fullDenomination].trim();
          }

          if (spreadSheetRow[SpreadSheetOrganization.publicDenomination]) {
            importErrors.org.denomination.public = spreadSheetRow[SpreadSheetOrganization.publicDenomination].trim();
          }

          // EMAIL
          if (spreadSheetRow[SpreadSheetOrganization.orgEmail]) {
            importErrors.org.email = spreadSheetRow[SpreadSheetOrganization.orgEmail].trim().toLowerCase();
          }

          // SUPER ADMIN
          if (spreadSheetRow[SpreadSheetOrganization.superAdminEmail]) {
            importErrors.superAdmin.email = spreadSheetRow[SpreadSheetOrganization.superAdminEmail].trim().toLowerCase();
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
