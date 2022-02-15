import { Component, ChangeDetectionStrategy, OnInit, Input, } from '@angular/core';
import { RouterQuery } from '@datorama/akita-ng-router-store';
import { appName, getCurrentApp } from '@blockframes/utils/apps';
import { Contract, ContractStatus, Sale } from '@blockframes/contract/contract/+state';
import { OrganizationService } from '@blockframes/organization/+state';
import { ActivatedRoute, Router } from '@angular/router';
import { filter, map, startWith } from 'rxjs/operators';
import { FormControl } from '@angular/forms';
import { BehaviorSubject, combineLatest, Observable } from 'rxjs';
import { DynamicTitleService } from '@blockframes/utils/dynamic-title/dynamic-title.service';
import { centralOrgId } from '@env';
import { isInitial } from '@blockframes/contract/negotiation/utils';
import { Negotiation } from '@blockframes/contract/negotiation/+state/negotiation.firestore';

function capitalize(text: string) {
  return `${text[0].toUpperCase()}${text.substring(1)}`
}

interface HydratedSale extends Sale<Date> {
  licensor: string;
  licensee: string;
  title: string;
  negotiation: Negotiation<Date>
}

@Component({
  selector: 'sale-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SaleListComponent implements OnInit {
  public app = getCurrentApp(this.routerQuery);
  public appName = appName[this.app];
  public orgId = this.orgService.org.id;

  @Input() private title = 'My Sale';

  private _internalSales = new BehaviorSubject<HydratedSale[]>([]);
  private _externalSales = new BehaviorSubject<HydratedSale[]>([]);


  filter = new FormControl();
  filter$: Observable<ContractStatus | ''> = this.filter.valueChanges.pipe(startWith(this.filter.value || ''));

  public sales$ = combineLatest([this._internalSales, this._externalSales]).pipe(map(sales => sales.flat()));

  public salesCount$ = this._internalSales.pipe(
    filter(data => !!data),
    map(m => ({
    all: m.length,
    new: m.filter(m => m.negotiation?.status === 'pending' && isInitial(m.negotiation)).length,
    accepted: m.filter(m => m.negotiation?.status === 'accepted').length,
    declined: m.filter(m => m.negotiation?.status === 'declined').length,
    negotiating: m.filter(m => m.negotiation?.status === 'pending' && !isInitial(m.negotiation)).length,
  }))
  );

  constructor(
    private routerQuery: RouterQuery,
    private orgService: OrganizationService,
    private router: Router,
    private dynTitle: DynamicTitleService,
    private route: ActivatedRoute,
  ) { }

  @Input() set internalSales(sale: HydratedSale[]) {
    this._internalSales.next(sale);
  }

  get internalSales() {
    return this._internalSales.value;
  }

  @Input() set externalSales(sale: HydratedSale[]) {
    this._externalSales.next(sale);
  }

  get externalSales() {
    return this._externalSales.value;
  }


  goToSale({ id }: Contract) {
    this.router.navigate([id], { relativeTo: this.route });
  }

  applyFilter(filter?: ContractStatus) {
    this.filter.setValue(filter);
    const titleFilter = filter === 'pending' ? 'new' : filter;
    const pageTitle = `${this.title} (${titleFilter ? capitalize(titleFilter) : 'All'})`;
    this.dynTitle.setPageTitle(pageTitle);
  }

  resetFilter() {
    this.filter.reset('');
    this.dynTitle.setPageTitle(`${this.title} (All)`);
  }

  /* index paramater is unused because it is a default paramater from the filter javascript function */
  filterBySalesStatus(sale: Sale, index: number, status: ContractStatus): boolean {
    if (!status) return true;
    return sale.status === status;
  }

  getLicensorId(sale: Sale) {
    return sale.stakeholders.find(
      orgId => ![centralOrgId.catalog, sale.buyerId].includes(orgId)
    ) ?? sale.sellerId;
  }

  ngOnInit() {
    this.dynTitle.setPageTitle(`${this.title} (All)`);
  }
}
