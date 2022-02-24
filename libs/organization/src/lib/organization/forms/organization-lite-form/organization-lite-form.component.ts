import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { organizationRoles } from '@blockframes/organization/+state';
import { getCurrentApp } from '@blockframes/utils/apps';
import { orgActivity } from '@blockframes/utils/static-model/static-model';
import { OrganizationLiteForm } from '../organization-lite.form';

@Component({
  selector: '[form] organization-lite-form',
  templateUrl: './organization-lite-form.component.html',
  styleUrls: ['./organization-lite-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OrganizationLiteFormComponent {
  public app = getCurrentApp(this.route)
  public roles = organizationRoles;
  public activities = orgActivity;

  @Input() form: OrganizationLiteForm;

  constructor(private route: ActivatedRoute) { }

}
