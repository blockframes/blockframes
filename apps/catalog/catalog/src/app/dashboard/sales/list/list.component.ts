import { Component, ChangeDetectionStrategy, Optional, OnInit } from '@angular/core';
import { ContractService } from '@blockframes/contract/contract/+state';
import { Intercom } from 'ng-intercom';
import { joinWith } from 'ngfire';
import { map } from 'rxjs/operators';
import { combineLatest, of } from 'rxjs';
import { MovieService } from '@blockframes/movie/service';
import { IncomeService } from '@blockframes/contract/income/+state';
import { DynamicTitleService } from '@blockframes/utils/dynamic-title/dynamic-title.service';
import { getSeller } from '@blockframes/contract/contract/+state/utils'
import { Organization, Sale } from '@blockframes/model';
import { OrganizationService } from '@blockframes/organization/service';
import { orderBy, where } from 'firebase/firestore';

function queryConstraints(orgId: string, options: { internal?: boolean }) {
  if (options.internal) {
    return [
      where('buyerId', '!=', ''),
      where('type', '==', 'sale'),
      orderBy('buyerId', 'desc'),
      where('stakeholders', 'array-contains', orgId),
      orderBy('_meta.createdAt', 'desc')
    ]
  }

  return [
    where('buyerId', '==', ''),
    where('type', '==', 'sale'),
    where('stakeholders', 'array-contains', orgId),
    orderBy('_meta.createdAt', 'desc')
  ]
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
  private orgId = this.orgService.org.id;

  public internalSales$ = this.contractService.valueChanges(queryConstraints(this.orgId, { internal: true })).pipe(
    joinWith({
      licensor: (sale: Sale) => this.orgService.valueChanges(getSeller(sale)).pipe(map(getFullName)),
      licensee: (sale: Sale) => this.orgService.valueChanges(sale.buyerId).pipe(map(getFullName)),
      title: (sale: Sale) => this.titleService.valueChanges(sale.titleId).pipe(map(title => title.title.international)),
      negotiation: (sale: Sale) => this.contractService.lastNegotiation(sale.id)
    }),
  );

  public externalSales$ = this.contractService.valueChanges(queryConstraints(this.orgId, { internal: false })).pipe(
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
    private orgService: OrganizationService,
    private titleService: MovieService,
    private incomeService: IncomeService,
    private dynTitle: DynamicTitleService,
    @Optional() private intercom: Intercom,
  ) { }

  ngOnInit() {
    this.dynTitle.setPageTitle('My Deals (All)');
  }

  public openIntercom() {
    return this.intercom.show();
  }

}
