import { Component, ChangeDetectionStrategy, Input, ChangeDetectorRef } from '@angular/core';
// Blockframes
import { organizationStatus, getAllAppsExcept } from '@blockframes/model';
import { OrganizationCrmForm } from '@blockframes/admin/crm/forms/organization-crm.form';
import { UntypedFormControl } from '@angular/forms';
import { AlgoliaService } from '@blockframes/utils/algolia';
import { boolean } from '@blockframes/utils/decorators/decorators';

@Component({
  selector: '[form] crm-organization-form',
  templateUrl: './organization-form.component.html',
  styleUrls: ['./organization-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CrmOrganizationFormComponent {
  @Input() form: OrganizationCrmForm;

  @Input() @boolean disableCropper = false;
  @Input() orgId: string;

  public organizationStatus = organizationStatus;
  public app = getAllAppsExcept(['crm']);
  public notifyCheckbox = new UntypedFormControl(false);

  constructor(
    private algoliaService: AlgoliaService,
    private cdr: ChangeDetectorRef
  ) { }

  public async uniqueOrgName() {
    if (!this.form.get('name').value) return;
    const orgName = this.form.get('name').value.trim();
    const orgId = await this.algoliaService.getOrgIdFromName(orgName);
    if (orgId && orgId !== this.orgId) {
      this.form.get('name').setErrors({ notUnique: true });
      this.cdr.markForCheck();
    }
  }
}
