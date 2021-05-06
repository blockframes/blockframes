import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
// Blockframes
import { organizationStatus } from '@blockframes/utils/static-model';
import { OrganizationAdminForm } from '@blockframes/admin/admin-panel/forms/organization-admin.form';
import { getAllAppsExcept } from '@blockframes/utils/apps';
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

  @Input() @boolean disableCropper = false;
  @Input() orgId: string;

  public organizationStatus = organizationStatus;
  public app = getAllAppsExcept(['crm']);
  public notifyCheckbox = new FormControl(false);

  constructor(
    private organizationService: OrganizationService,
  ) {}

  public async uniqueOrgName() {
    const orgName = this.form.get('denomination').get('full').value
    const unique = await this.organizationService.uniqueOrgName(orgName);
    if (!unique) {
      this.form.get('denomination').get('full').setErrors({ notUnique: true });
    }
  }
}
