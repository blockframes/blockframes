import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterQuery } from '@datorama/akita-ng-router-store';
import { appName, getCurrentApp } from '@blockframes/utils/apps';
import { Organization, OrganizationService } from '@blockframes/organization/+state';
import { DynamicTitleService } from '@blockframes/utils/dynamic-title/dynamic-title.service';
import { CollectionReference } from '@angular/fire/firestore';
import { Sale, ContractService } from '@blockframes/contract/contract/+state';
import { IncomeService } from '@blockframes/contract/income/+state';
import { MovieService } from '@blockframes/movie/+state';
import { joinWith } from '@blockframes/utils/operators';
import { centralOrgId } from '@env';
import { of } from 'rxjs';
import { map } from 'rxjs/operators';

function queryFn(ref: CollectionReference, options: { internal?: boolean }) {
  if (options.internal)
    return ref
      .where('buyerId', '!=', '')
      .where('type', '==', 'sale')
      .orderBy('buyerId', 'desc')
      .orderBy('_meta.createdAt', 'desc')
  return ref
    .where('buyerId', '==', '')
    .where('type', '==', 'sale')
    .orderBy('_meta.createdAt', 'desc')
}

function getFullName(seller: Organization) {
  return seller.denomination.full;
}

@Component({
  selector: 'crm-contracts-list',
  templateUrl: './contracts-list.component.html',
  styleUrls: ['./contracts-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ContractsListComponent {
  public app = getCurrentApp(this.routerQuery);
  public appName = appName[this.app];
  public orgId = this.orgService.org.id;


  public externalSales$ = this.contractService.valueChanges(ref => queryFn(ref, { internal: false })).pipe(
    joinWith({
      licensor: (sale: Sale) => {
        return this.orgService.valueChanges(this.getLicensorId(sale)).pipe(map(getFullName))
      },
      licensee: () => of('External'),
      title: (sale: Sale) => this.titleService.valueChanges(sale.titleId).pipe(map(title => title.title.international)),
      price: (sale: Sale) => this.incomeService.valueChanges(sale.id),
    }),
  );

  constructor(
    private contractService: ContractService,
    private routerQuery: RouterQuery,
    private orgService: OrganizationService,
    private titleService: MovieService,
    private incomeService: IncomeService,
    private dynTitle: DynamicTitleService,
  ) { }

  ngOnInit() {
    this.dynTitle.setPageTitle('My Sales (All)');
  }

  getLicensorId(sale: Sale) {
    return sale.stakeholders.find(
      orgId => ![centralOrgId.catalog, sale.buyerId].includes(orgId)
    ) ?? sale.sellerId;
  }
}
