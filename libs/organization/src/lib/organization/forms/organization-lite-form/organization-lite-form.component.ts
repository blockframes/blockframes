import { Component, ChangeDetectionStrategy, Input, Inject } from '@angular/core';
import { organizationRoles, orgActivity, App } from '@blockframes/model';
import { APP } from '@blockframes/utils/routes/utils';
import { OrganizationLiteForm } from '../organization-lite.form';

@Component({
  selector: '[form] organization-lite-form',
  templateUrl: './organization-lite-form.component.html',
  styleUrls: ['./organization-lite-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OrganizationLiteFormComponent {
  public roles = organizationRoles;
  public activities = orgActivity;

  @Input() form: OrganizationLiteForm;

  constructor(@Inject(APP) public app: App) { }

}
