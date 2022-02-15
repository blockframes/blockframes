import { Component, ChangeDetectionStrategy, Optional } from '@angular/core';
import { RouterQuery } from '@datorama/akita-ng-router-store';
import { appName, getCurrentApp } from '@blockframes/utils/apps';
import { Contract, ContractService, ContractStatus, Sale } from '@blockframes/contract/contract/+state';
import { Organization, OrganizationService } from '@blockframes/organization/+state';
import { ActivatedRoute, Router } from '@angular/router';
import { joinWith } from '@blockframes/utils/operators';
import { map, startWith } from 'rxjs/operators';
import { MovieService } from '@blockframes/movie/+state';
import { IncomeService } from '@blockframes/contract/income/+state';
import { FormControl } from '@angular/forms';
import { combineLatest, Observable, of } from 'rxjs';
import { DynamicTitleService } from '@blockframes/utils/dynamic-title/dynamic-title.service';
import { CollectionReference } from '@angular/fire/firestore';
import { centralOrgId } from '@env';
import { isInitial } from '@blockframes/contract/negotiation/utils';

function capitalize(text: string) {
  return `${text[0].toUpperCase()}${text.substring(1)}`
}

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
  selector: 'crm-contracts-shell',
  templateUrl: './contracts-shell.component.html',
  styleUrls: ['./contracts-shell.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ContractsShellComponent {
  public app = getCurrentApp(this.routerQuery);
  public appName = appName[this.app];
  public orgId = this.orgService.org.id;

  public internalSales$ = this.contractService.valueChanges(ref => queryFn(ref, { internal: true })).pipe(
    joinWith({
      licensor: (sale: Sale) => this.orgService.valueChanges(this.getLicensorId(sale)).pipe(map(getFullName)),
      licensee: (sale: Sale) => this.orgService.valueChanges(sale.buyerId).pipe(map(getFullName)),
      title: (sale: Sale) => this.titleService.valueChanges(sale.titleId).pipe(map(title => title.title.international)),
      negotiation: (sale: Sale) => this.contractService.lastNegotiation(sale.id)
    }),
  );

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

  public sales$ = combineLatest([this.internalSales$, this.externalSales$]).pipe(map(sales => sales.flat()));

  constructor(
    private contractService: ContractService,
    private routerQuery: RouterQuery,
    private orgService: OrganizationService,
    private titleService: MovieService,
    private incomeService: IncomeService,
    private dynTitle: DynamicTitleService,

  ) { }


  getLicensorId(sale: Sale) {
    return sale.stakeholders.find(
      orgId => ![centralOrgId.catalog, sale.buyerId].includes(orgId)
    ) ?? sale.sellerId;
  }


  ngOnInit() {
    this.dynTitle.setPageTitle('My Sales (All)');
  }
}
