import { Component, ChangeDetectionStrategy, Input, Inject } from '@angular/core';
import { orgActivity, organizationRoles } from '@blockframes/shared/model';
import { App } from '@blockframes/utils/apps';
import { APP } from '@blockframes/utils/routes/utils';
import { OrganizationLiteForm } from '../organization-lite.form';

@Component({
  selector: '[form] organization-lite-form',
  templateUrl: './organization-lite-form.component.html',
  styleUrls: ['./organization-lite-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrganizationLiteFormComponent {
  public roles = organizationRoles;
  public activities = orgActivity;

  @Input() form: OrganizationLiteForm;

  constructor(@Inject(APP) public app: App) {}
}
