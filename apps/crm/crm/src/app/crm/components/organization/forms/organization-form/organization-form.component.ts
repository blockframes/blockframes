import { Component, ChangeDetectionStrategy, Input, OnInit, ChangeDetectorRef } from '@angular/core';
// Blockframes
import { organizationStatus, getAllAppsExcept } from '@blockframes/model';
import { OrganizationCrmForm } from '@blockframes/admin/crm/forms/organization-crm.form';
import { FormControl } from '@angular/forms';
import { OrganizationService } from '@blockframes/organization/+state';
import { boolean } from '@blockframes/utils/decorators/decorators';

@Component({
  selector: '[form] crm-organization-form',
  templateUrl: './organization-form.component.html',
  styleUrls: ['./organization-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CrmOrganizationFormComponent implements OnInit {
  @Input() form: OrganizationCrmForm;

  @Input() @boolean disableCropper = false;
  @Input() orgId: string;

  public organizationStatus = organizationStatus;
  public app = getAllAppsExcept(['crm']);
  public notifyCheckbox = new FormControl(false);
  private currentOrgName: string;

  constructor(
    private organizationService: OrganizationService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit() {
    this.currentOrgName = this.form.get('denomination').get('full').value.trim();
  }

  public async uniqueOrgName() {
    const orgName = this.form.get('denomination').get('full').value.trim();
    const unique = await this.organizationService.uniqueOrgName(orgName);
    if (!unique && orgName !== this.currentOrgName) {
      this.form.get('denomination').get('full').setErrors({ notUnique: true });
      this.cdr.markForCheck();
    }
  }
}
