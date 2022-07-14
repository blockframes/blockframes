import { Component, ChangeDetectionStrategy, ViewEncapsulation } from '@angular/core';
import { OrganizationService } from '@blockframes/organization/service';

@Component({
  selector: 'financiers-marketplace',
  templateUrl: './marketplace.component.html',
  styleUrls: ['./marketplace.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class MarketplaceComponent {
  public org$ = this.orgService.currentOrg$;

  constructor(private orgService: OrganizationService) { }
}
