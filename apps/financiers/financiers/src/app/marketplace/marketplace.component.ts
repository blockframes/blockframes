import { Component, ChangeDetectionStrategy } from '@angular/core';
import { OrganizationService } from '@blockframes/organization/+state';

@Component({
  selector: 'financiers-marketplace',
  templateUrl: './marketplace.component.html',
  styleUrls: ['./marketplace.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MarketplaceComponent {
  public org$ = this.orgService.org$;

  constructor(private orgService: OrganizationService) { }
}
