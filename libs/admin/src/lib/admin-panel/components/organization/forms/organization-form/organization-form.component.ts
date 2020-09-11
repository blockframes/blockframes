import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
// Blockframes
import { staticConsts } from '@blockframes/utils/static-model';
import { OrganizationAdminForm } from '@blockframes/admin/admin-panel/forms/organization-admin.form';
import { app } from '@blockframes/utils/apps';
import { FormControl } from '@angular/forms';
import { OrganizationService } from '@blockframes/organization/+state';
import { boolean } from '@blockframes/utils/decorators/decorators';

@Component({
  selector: '[form] admin-organization-form',
  templateUrl: './organization-form.component.html',
  styleUrls: ['./organization-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AdminOrganizationFormComponent {
  @Input() form: OrganizationAdminForm;
  @Input() set orgId(orgId: string) {
    this.storagePath = `orgs/${orgId}/logo`;
    console.log('storage path', this.storagePath);
  } 

  // TODO#2914 Re-enable the cropper here when we found a solution
  @Input() @boolean disableCropper = false;

  public organizationStatus = staticConsts.organizationStatus;
  public app = app;
  public notifyCheckbox = new FormControl(false);
  public storagePath: string;

  constructor(
    private organizationService: OrganizationService
  ) {

  }

  public async uniqueOrgName() {
    const orgName = this.form.get('denomination').get('full').value
    const unique = await this.organizationService.uniqueOrgName(orgName);
    if (!unique) {
      this.form.get('denomination').get('full').setErrors({ notUnique: true });
    }
  }
}
