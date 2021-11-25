import { Component, ChangeDetectionStrategy, Optional, OnInit, } from '@angular/core';
import { RouterQuery } from '@datorama/akita-ng-router-store';
import { appName, getCurrentApp } from '@blockframes/utils/apps';
import { Contract, ContractService, ContractStatus, Sale } from '@blockframes/contract/contract/+state';
import { OrganizationQuery, OrganizationService } from '@blockframes/organization/+state';
import { ActivatedRoute, Router } from '@angular/router';
import { Intercom } from 'ng-intercom';
import { joinWith } from '@blockframes/utils/operators';
import { map, startWith } from 'rxjs/operators';
import { MovieService } from '@blockframes/movie/+state';
import { IncomeService } from '@blockframes/contract/income/+state';
import { FormControl } from '@angular/forms';
import { Observable } from 'rxjs';
import { DynamicTitleService } from '@blockframes/utils/dynamic-title/dynamic-title.service';
import { CollectionReference } from '@angular/fire/firestore';


function capitalize(text: string) {
  return `${text[0].toUpperCase()}${text.substring(1)}`
}

function queryFn(ref: CollectionReference, orgId: string) {
  return ref.where('stakeholders', 'array-contains', orgId)
    .where('type', '==', 'sale')
    .orderBy('_meta.createdAt', 'desc')
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
  public orgId = this.orgQuery.getActiveId();


  public sales$ = this.contractService.valueChanges(
    ref => queryFn(ref, this.orgId)
  ).pipe(
    joinWith({
      licensor: (sale: Sale) => this.orgService.valueChanges(sale.sellerId).pipe(map(seller => seller.denomination.full)),
      licensee: (sale: Sale) => sale.buyerId ? this.orgService.valueChanges(sale.buyerId).pipe(map(buyer => buyer.denomination.full)) : 'External',
      title: (sale: Sale) => this.titleService.valueChanges(sale.titleId).pipe(map(title => title.title.international)),
      price: (sale: Sale) => this.incomeService.valueChanges(sale.id),
      negotiation: (sale: Sale) => sale.status === 'negotiating' ? this.contractService.lastNegociation(sale.id) : null
    }),
  );
  filter = new FormControl();
  filter$: Observable<ContractStatus | ''> = this.filter.valueChanges.pipe(startWith(this.filter.value || ''));

  salesCount$ = this.sales$.pipe(map(m => ({
    all: m.length,
    new: m.filter(m => m.status === 'pending').length,
    accepted: m.filter(m => m.status === 'accepted').length,
    declined: m.filter(m => m.status === 'declined').length,
    negotiation: m.filter(m => m.status === 'negotiating').length,
  })));



  constructor(
    private contractService: ContractService,
    private orgQuery: OrganizationQuery,
    private routerQuery: RouterQuery,
    private orgService: OrganizationService,
    private titleService: MovieService,
    private incomeService: IncomeService,
    private router: Router,
    private dynTitle: DynamicTitleService,
    private route: ActivatedRoute,
    @Optional() private intercom: Intercom,

  ) { }


  goToSale({ id }: Contract) {
    this.router.navigate([id], { relativeTo: this.route });
  }

  applyFilter(filter?: ContractStatus) {
    this.filter.setValue(filter);
    const titleFilter = filter === 'pending' ? 'new' : filter;
    const pageTitle = `My Sales ( ${titleFilter ? capitalize(titleFilter) : 'All'} )`;
    this.dynTitle.setPageTitle(pageTitle);
  }

  resetFilter() {
    this.filter.reset('');
    this.dynTitle.setPageTitle('My Sales ( All )');
  }

  /* index paramater is unused because it is a default paramater from the filter javascript function */
  filterBySalesStatus(sale: Sale, index: number, status: ContractStatus): boolean {
    if (!status) return true;
    return sale.status === status;
  }

  ngOnInit() {
    this.dynTitle.setPageTitle('My Sales ( All )');
  }

  public openIntercom() {
    return this.intercom.show();
  }

}
