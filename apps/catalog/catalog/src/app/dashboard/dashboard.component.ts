// Angular
import { Component, ChangeDetectionStrategy, ViewEncapsulation } from '@angular/core';
import { OrganizationService } from '@blockframes/organization/service';

@Component({
  selector: 'catalog-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class DashboardComponent {
  org$ = this.orgService.currentOrg$;

  constructor(private orgService: OrganizationService) { }
}
