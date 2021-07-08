import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterQuery } from '@datorama/akita-ng-router-store';
import { appName, getCurrentApp } from '@blockframes/utils/apps';
import { ContractService } from '@blockframes/contract/contract/+state';
import { OrganizationQuery } from '@blockframes/organization/+state';

const columns = {
  'offerId': 'Offer Reference',
  'titleId': 'Title',
  'id': 'Price',
  '_meta.createdAt': 'Date',
  'status': 'Approval',
};


@Component({
  selector: 'catalog-contract-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ContractListComponent {
  public app = getCurrentApp(this.routerQuery);
  public appName = appName[this.app];
  columns = columns;
  initialColumns = ['offerId', 'titleId', 'id', '_meta.createdAt', 'status',];
  orgId = this.orgQuery.getActiveId();
  contracts$ = this.service.valueChanges(
    ref => ref.where('stakeholders', 'array-contains', this.orgId)
      .where('type', '==', 'sale')
  );

  constructor(
    private service: ContractService,
    private orgQuery: OrganizationQuery,
    private routerQuery: RouterQuery,
  ) { }
}
