import { Component, ChangeDetectionStrategy, Optional, } from '@angular/core';
import { RouterQuery } from '@datorama/akita-ng-router-store';
import { appName, getCurrentApp } from '@blockframes/utils/apps';
import { Contract, ContractService, contractStatus, ContractStatus, Sale } from '@blockframes/contract/contract/+state';
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
import { sl } from 'date-fns/locale';


@Component({
  selector: 'catalog-sale-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SaleListComponent {
  public app = getCurrentApp(this.routerQuery);
  public appName = appName[this.app];
  public orgId = this.orgQuery.getActiveId();

  public sales$ = this.contractService.valueChanges(ref => ref.where('stakeholders', 'array-contains', this.orgId)
    .where('type', '==', 'sale')
    .orderBy('_meta.createdAt', 'desc')
  ).pipe(
    joinWith({
      licensor: (sale: Sale) => this.orgService.valueChanges(sale.sellerId).pipe(map(seller => seller.denomination.full)),
      licensee: (sale: Sale) => this.orgService.valueChanges(sale.buyerId).pipe(map(buyer => buyer.denomination.full)),
      title: (sale: Sale) => this.titleService.valueChanges(sale.titleId).pipe(map(title => title.title.original)),
      price: (sale: Sale) => this.incomeService.valueChanges(sale.id),//.pipe(map(income => income.price)),
    }),
  );
  filter = new FormControl();
  filter$: Observable<ContractStatus | ''> = this.filter.valueChanges.pipe(startWith(this.filter.value || ''));

  salesCount$ = this.sales$.pipe(map(m => ({
    all: m.length,
    new: m.filter(m => m.status === 'pending').length,
    accepted: m.filter(m => m.status === 'accepted').length,
    declined: m.filter(m => m.status === 'declined').length,
    archived: m.filter(m => m.status === 'archived').length,
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
    this.dynTitle.setPageTitle(contractStatus[filter]);
  }

  resetFilter() {
    this.filter.reset('');
    this.dynTitle.useDefault();
  }

  /* index paramater is unused because it is a default paramater from the filter javascript function */
  filterBySalesStatus(sale: Sale, index: number, status: ContractStatus): boolean {
    //@TODO FILTER DOESN'T FUNCTION FINE.
    if (status) return false;
    return sale.status !== status;
  }



  public openIntercom() {
    return this.intercom.show();
  }

}
