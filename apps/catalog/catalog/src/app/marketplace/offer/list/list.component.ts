import { Component, ChangeDetectionStrategy } from '@angular/core';
import { OfferService } from '@blockframes/contract/offer/+state';
import { OrganizationQuery } from '@blockframes/organization/+state';
import { switchMap } from 'rxjs/operators';

@Component({
  selector: 'catalog-offer-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ListComponent {
  offers$ = this.orgQuery.selectActiveId().pipe(
    switchMap(orgId => this.service.queryWithContracts(ref => ref.where('buyerId', '==', orgId)))
  );

  constructor(
    private orgQuery: OrganizationQuery,
    private service: OfferService,
  ) { }

}
