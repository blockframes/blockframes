import { Component, ChangeDetectionStrategy, Optional, OnInit } from '@angular/core';
import { ContractService } from '@blockframes/contract/contract/service';
import { Intercom } from 'ng-intercom';
import { joinWith } from 'ngfire';
import { combineLatest, of, map } from 'rxjs';
import { MovieService } from '@blockframes/movie/service';
import { IncomeService } from '@blockframes/contract/income/service';
import { DynamicTitleService } from '@blockframes/utils/dynamic-title/dynamic-title.service';
import { getSeller } from '@blockframes/contract/contract/utils'
import { Sale } from '@blockframes/model';
import { OrganizationService } from '@blockframes/organization/service';
import { orderBy, where } from 'firebase/firestore';
import { ActivatedRoute, Router } from '@angular/router';

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
      licensor: (sale: Sale) => this.orgService.valueChanges(getSeller(sale)).pipe(map(org => org.name)),
      licensee: (sale: Sale) => this.orgService.valueChanges(sale.buyerId).pipe(map(org => org.name)),
      title: (sale: Sale) => this.titleService.valueChanges(sale.titleId).pipe(map(title => title.title.international)),
      negotiation: (sale: Sale) => this.contractService.lastNegotiation(sale.id)
    }),
  );

  public externalSales$ = this.contractService.valueChanges(queryConstraints(this.orgId, { internal: false })).pipe(
    joinWith({
      licensor: (sale: Sale) => this.orgService.valueChanges(getSeller(sale)).pipe(map(org => org.name)),
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
    private router: Router,
    private route:ActivatedRoute,
    @Optional() private intercom: Intercom,
  ) { }

  ngOnInit() {
    this.dynTitle.setPageTitle('My Deals (All)');
  }

  public openIntercom() {
    return this.intercom.show();
  }

  public goToSale(id:string){
    this.router.navigate([id], { relativeTo: this.route });
  }

}
