import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { OrganizationService } from './../../+state/organization.service';
import { orgActivity } from '@blockframes/utils/static-model/static-model';
import { OrganizationLiteForm } from '../organization-lite.form';

@Component({
  selector: '[form] organization-lite-form',
  templateUrl: './organization-lite-form.component.html',
  styleUrls: ['./organization-lite-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OrganizationLiteFormComponent {
  public activities = orgActivity;
  
  @Input() form: OrganizationLiteForm;

  constructor(private service: OrganizationService) { }

  public async uniqueOrgName() { // @TODO #4932 not used here
    const orgName = this.form.get('denomination').get('full').value
    const unique = await this.service.uniqueOrgName(orgName);
    if(!unique){
      this.form.get('denomination').get('full').setErrors({ notUnique: true });
    }
  }
}
