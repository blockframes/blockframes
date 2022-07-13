import { Component, ChangeDetectionStrategy, ViewEncapsulation } from '@angular/core';
import { OrganizationService } from '@blockframes/organization/service';

@Component({
  selector: 'marketplace-aside',
  templateUrl: './aside.component.html',
  styleUrls: ['./aside.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class AsideComponent {
  public org$ = this.orgService.currentOrg$;

  constructor(private orgService: OrganizationService) { }
}
