// Angular
import { Component, ChangeDetectionStrategy } from '@angular/core';
import { OrganizationService } from '@blockframes/organization/+state';

@Component({
  selector: 'financiers-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DashboardComponent {
  public org$ = this.orgService.currentOrg$;

  constructor(private orgService: OrganizationService) { }
}
