// Angular
import { Component, ChangeDetectionStrategy, ViewEncapsulation } from '@angular/core';
import { OrganizationService } from '@blockframes/organization/service';

@Component({
  selector: 'festival-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class DashboardComponent {
  public org$ = this.orgService.currentOrg$;

  constructor(private orgService: OrganizationService) { }
}
