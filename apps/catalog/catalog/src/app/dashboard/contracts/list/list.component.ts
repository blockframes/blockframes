import { Component, ChangeDetectionStrategy, Optional } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { DynamicTitleService } from '@blockframes/utils/dynamic-title/dynamic-title.service';
import { Intercom } from 'ng-intercom';
import { RouterQuery } from '@datorama/akita-ng-router-store';
import { appName, getCurrentApp } from '@blockframes/utils/apps';
import { ContractService } from '@blockframes/contract/contract/+state';

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
  initialColumns = ['offerId', 'titleId', 'id', '_meta.createdAt', 'status',]; // 'sales' should be added here but removed due to the #5060 issue
  contracts$ = this.service.valueChanges(ref => ref.where('type', '==', 'sale'));

  constructor(
    private service: ContractService,
    private router: Router,
    private route: ActivatedRoute,
    private dynTitle: DynamicTitleService,
    private routerQuery: RouterQuery,
    @Optional() private intercom: Intercom
  ) { }

  public openIntercom(): void {
    return this.intercom.show();
  }
}
