import { Component, ChangeDetectionStrategy, Optional, OnInit, } from '@angular/core';
import { RouterQuery } from '@datorama/akita-ng-router-store';
import { appName, getCurrentApp } from '@blockframes/utils/apps';
import { ContractService, Sale } from '@blockframes/contract/contract/+state';
import { Organization, OrganizationService } from '@blockframes/organization/+state';
import { Intercom } from 'ng-intercom';
import { joinWith } from '@blockframes/utils/operators';
import { map } from 'rxjs/operators';
import { combineLatest, of } from 'rxjs';
import { MovieService } from '@blockframes/movie/+state';
import { IncomeService } from '@blockframes/contract/income/+state';
import { DynamicTitleService } from '@blockframes/utils/dynamic-title/dynamic-title.service';
import { CollectionReference } from '@angular/fire/firestore';
import { getSeller } from '@blockframes/contract/contract/+state/utils'

function queryFn(ref: CollectionReference, orgId: string, options: { internal?: boolean }) {
  const operator = options.internal ? '!=' : "==";
  return ref
    .where('buyerId', operator, '')
    .where('type', '==', 'sale')
    .orderBy('buyerId', 'desc')
    .where('stakeholders', 'array-contains', orgId)
    .orderBy('_meta.createdAt', 'desc')
}

function getFullName(seller: Organization) {
  return seller.denomination.full;
}

@Component({
  selector: 'catalog-sale-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SaleListComponent implements OnInit {
  public app = getCurrentApp(this.routerQuery);
  public appName = appName[this.app];
  public orgId = this.orgService.org.id;


  public internalSales$ = this.contractService.valueChanges(ref => queryFn(ref, this.orgId, { internal: true })).pipe(
    joinWith({
      licensor: (sale: Sale) => this.orgService.valueChanges(getSeller(sale)).pipe(map(getFullName)),
      licensee: (sale: Sale) => this.orgService.valueChanges(sale.buyerId).pipe(map(getFullName)),
      title: (sale: Sale) => this.titleService.valueChanges(sale.titleId).pipe(map(title => title.title.international)),
      negotiation: (sale: Sale) => this.contractService.lastNegotiation(sale.id)
    }),
  );

  public externalSales$ = this.contractService.valueChanges(ref => queryFn(ref, this.orgId, { internal: true })).pipe(
    joinWith({
      licensor: (sale: Sale) => this.orgService.valueChanges(getSeller(sale)).pipe(map(getFullName)),
      licensee: () => of('External'),
      title: (sale: Sale) => this.titleService.valueChanges(sale.titleId).pipe(map(title => title.title.international)),
      price: (sale: Sale) => this.incomeService.valueChanges(sale.id),
    }),
  );

  public sales$ = combineLatest([this.internalSales$, this.externalSales$]);

  constructor(
    private contractService: ContractService,
    private routerQuery: RouterQuery,
    private orgService: OrganizationService,
    private titleService: MovieService,
    private incomeService: IncomeService,
    private dynTitle: DynamicTitleService,
    @Optional() private intercom: Intercom,

  ) { }

  ngOnInit() {
    this.dynTitle.setPageTitle('My Sales (All)');
  }

  public openIntercom() {
    return this.intercom.show();
  }

}
