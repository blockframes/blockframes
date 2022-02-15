import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterQuery } from '@datorama/akita-ng-router-store';
import { appName, getCurrentApp } from '@blockframes/utils/apps';
import { Contract, ContractStatus, Sale } from '@blockframes/contract/contract/+state';
import { OrganizationService } from '@blockframes/organization/+state';
import { ActivatedRoute, Router } from '@angular/router';
import { map, startWith } from 'rxjs/operators';
import { FormControl } from '@angular/forms';
import { Observable, of } from 'rxjs';
import { DynamicTitleService } from '@blockframes/utils/dynamic-title/dynamic-title.service';
import { centralOrgId } from '@env';
import { isInitial } from '@blockframes/contract/negotiation/utils';
import { ContractsShellComponent } from '../shell/contracts-shell.component';

function capitalize(text: string) {
  return `${text[0].toUpperCase()}${text.substring(1)}`
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

  public internalSales$ = this.shell.internalSales$;
  public externalSales$ = this.shell.externalSales$;

  filter = new FormControl();
  filter$: Observable<ContractStatus | ''> = this.filter.valueChanges.pipe(startWith(this.filter.value || ''));

  salesCount$ = this.internalSales$.pipe(map(m => ({
    all: m.length,
    new: m.filter(m => m.negotiation?.status === 'pending' && isInitial(m.negotiation)).length,
    accepted: m.filter(m => m.negotiation?.status === 'accepted').length,
    declined: m.filter(m => m.negotiation?.status === 'declined').length,
    negotiating: m.filter(m => m.negotiation?.status === 'pending' && !isInitial(m.negotiation)).length,
  })));

  constructor(
    private routerQuery: RouterQuery,
    private orgService: OrganizationService,
    private shell:ContractsShellComponent,
    private router: Router,
    private dynTitle: DynamicTitleService,
    private route: ActivatedRoute,
  ) { }


  goToSale({ id }: Contract) {
    this.router.navigate([id], { relativeTo: this.route });
  }

  applyFilter(filter?: ContractStatus) {
    this.filter.setValue(filter);
    const titleFilter = filter === 'pending' ? 'new' : filter;
    const pageTitle = `My Sales (${titleFilter ? capitalize(titleFilter) : 'All'})`;
    this.dynTitle.setPageTitle(pageTitle);
  }

  resetFilter() {
    this.filter.reset('');
    this.dynTitle.setPageTitle('My Sales (All)');
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
    this.dynTitle.setPageTitle('My Sales (All)');
  }
}
