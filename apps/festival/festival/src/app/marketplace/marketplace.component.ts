import { Component, ChangeDetectionStrategy } from '@angular/core';
import { OrganizationQuery, OrganizationDocumentWithDates } from '@blockframes/organization/+state';

@Component({
  selector: 'festival-marketplace',
  templateUrl: './marketplace.component.html',
  styleUrls: ['./marketplace.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MarketplaceComponent {

  public org$ = this.orgQuery.selectActive();

  constructor(private orgQuery: OrganizationQuery) { }

  canAccessDashboard(org: OrganizationDocumentWithDates): boolean {
    return org.appAccess.festival?.dashboard;
  }
}
