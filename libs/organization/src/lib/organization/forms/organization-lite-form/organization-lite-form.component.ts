import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { getCurrentApp } from '@blockframes/utils/apps';
import { orgActivity } from '@blockframes/utils/static-model/static-model';
import { RouterQuery } from '@datorama/akita-ng-router-store';
import { OrganizationLiteForm } from '../organization-lite.form';

const roles = {
  catalog: { dashboard: 'Seller', marketplace: 'Buyer'},
  festival: { dashboard: 'Sales Agent', marketplace: 'Buyer'},
  financiers: { dashboard: 'Partners', marketplace: 'Investor'}
};

@Component({
  selector: '[form] organization-lite-form',
  templateUrl: './organization-lite-form.component.html',
  styleUrls: ['./organization-lite-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OrganizationLiteFormComponent {
  public app = getCurrentApp(this.routerQuery)
  public roles = roles;
  public activities = orgActivity;

  @Input() form: OrganizationLiteForm;

  constructor(private routerQuery: RouterQuery) { }

}
