import { Component, ChangeDetectionStrategy, Pipe, PipeTransform } from '@angular/core';
import { RouterQuery } from '@datorama/akita-ng-router-store';
import { appName, getCurrentApp } from '@blockframes/utils/apps';
import { ContractService } from '@blockframes/contract/contract/+state';
import { OrganizationQuery } from '@blockframes/organization/+state';
import { OfferStatus } from '@blockframes/contract/offer/+state';

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
  public columns = columns;
  public initialColumns = ['offerId', 'titleId', 'id', '_meta.createdAt', 'status',];
  public orgId = this.orgQuery.getActiveId();
  public contracts$ = this.contractService.valueChanges(
    ref => ref.where('stakeholders', 'array-contains', this.orgId)
      .where('type', '==', 'sale')
  );

  constructor(
    private contractService: ContractService,
    private orgQuery: OrganizationQuery,
    private routerQuery: RouterQuery,
  ) { }
}

@Pipe({
  name: 'labelOfferStatus'
})
export class LabelOfferStatusPipe implements PipeTransform {
  transform(value: OfferStatus): string {
    if (!value) return '';
    switch (value) {
      case 'pending': return 'New';
      case 'negotiating': return 'In Negotiation';
      case 'accepted': return 'Accepted';
      case 'signing': return 'On Signature';
      case 'signed': return 'Signed';
      case 'declined': return 'Declined';
    }
  }
}
