import { Component, ChangeDetectionStrategy, Input, OnInit } from '@angular/core';
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
  public currentOrgName : string;

  constructor(
    private organizationService: OrganizationService,
  ) {}

  ngOnInit() {
    /** Get current orgName for not trigger error check 'The name is already taken' with it */
    this.currentOrgName = this.form.get('denomination').get('full').value
  }

  /** Check if the `name` field of an Organization create form already exists as an ENS domain */
  public async uniqueOrgName() {
    const orgName = this.form.get('denomination').get('full').value
    const unique = await this.organizationService.uniqueOrgName(orgName);
    if (!unique && orgName !== this.currentOrgName) {
      this.form.get('denomination').get('full').setErrors({ notUnique: true });
    }
  }
}
