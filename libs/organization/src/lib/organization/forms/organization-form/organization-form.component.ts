import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { OrganizationService } from './../../+state/organization.service';
import { OrganizationForm } from '@blockframes/organization/forms/organization.form';
import { OrganizationQuery } from '@blockframes/organization/+state';
import { boolean } from '@blockframes/utils/decorators/decorators';

@Component({
  selector: '[form] organization-form',
  templateUrl: './organization-form.component.html',
  styleUrls: ['./organization-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OrganizationFormComponent {

  public orgId = this.query.getActiveId();

  @Input() form: OrganizationForm;

  // TODO#2914 Re-enable the cropper here when we found a solution
  @Input() @boolean disableCropper = false;

  constructor(private service: OrganizationService, private query: OrganizationQuery) { }

  // ISSUE#2692
  // get bankAccounts() {
  //   return this.form.get('bankAccounts');
  // }

  /** Check if the `name` field of an Organization create form already exists as an ENS domain */
  public async uniqueOrgName() {
    const orgName = this.form.get('denomination').get('full').value
    const unique = await this.service.uniqueOrgName(orgName);
    if(!unique){
      this.form.get('denomination').get('full').setErrors({ notUnique: true });
    }
  }
}
