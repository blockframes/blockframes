import { Component, ChangeDetectionStrategy } from '@angular/core';
import { Subject } from 'rxjs';
import { OrganizationQuery } from '@blockframes/organization/+state';

@Component({
  selector: 'festival-marketplace',
  templateUrl: './marketplace.component.html',
  styleUrls: ['./marketplace.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MarketplaceComponent {
  activeLinkSubject: Subject<void> = new Subject<void>();

  public org$ = this.orgQuery.selectActive();

  constructor(private orgQuery: OrganizationQuery) { }

  clickOnLink(isActive: boolean) {
    if(isActive) {
      this.activeLinkSubject.next();
    }
  }
}
