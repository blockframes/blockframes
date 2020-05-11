// Angular
import { Component, ChangeDetectionStrategy } from '@angular/core';
import { OrganizationQuery, orgActivity } from '@blockframes/organization/+state';

@Component({
  selector: 'festival-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DashboardComponent {
  public org$ = this.orgQuery.selectActive();

  constructor(private orgQuery: OrganizationQuery) {}

  getActivity(activity: string) {
    return orgActivity[activity];
  }
}
