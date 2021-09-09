import { Component, ChangeDetectionStrategy, Optional, } from '@angular/core';
import { RouterQuery } from '@datorama/akita-ng-router-store';
import { appName, getCurrentApp } from '@blockframes/utils/apps';
import { Contract, ContractService } from '@blockframes/contract/contract/+state';
import { OrganizationQuery } from '@blockframes/organization/+state';
import { ActivatedRoute, Router } from '@angular/router';
import { Intercom } from 'ng-intercom';

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
      .orderBy('_meta.createdAt', 'desc')
  );

  constructor(
    private contractService: ContractService,
    private orgQuery: OrganizationQuery,
    private routerQuery: RouterQuery,
    private router: Router,
    private route: ActivatedRoute,
    @Optional() private intercom: Intercom,

  ) { }


  goToContract({ id }: Contract) {
    this.router.navigate([ id ], { relativeTo: this.route });
  }
  public openIntercom() {
    return this.intercom.show();
  }

}
