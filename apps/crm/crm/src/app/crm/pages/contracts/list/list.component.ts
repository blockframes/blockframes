import { Component, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { OrganizationService } from '@blockframes/organization/service';
import { DynamicTitleService } from '@blockframes/utils/dynamic-title/dynamic-title.service';
import { ContractService } from '@blockframes/contract/contract/service';
import { IncomeService, incomeQuery } from '@blockframes/contract/income/service';
import { MovieService } from '@blockframes/movie/service';
import { joinWith } from 'ngfire';
import { combineLatest, of, map } from 'rxjs';
import { getSeller } from '@blockframes/contract/contract/utils';
import { DetailedContract, Mandate, Sale, mandatesToExport, salesToExport } from '@blockframes/model';
import { orderBy, where } from 'firebase/firestore';
import { downloadCsvFromJson } from '@blockframes/utils/helpers';

const saleQuery = [
  where('type', '==', 'sale'),
  orderBy('_meta.createdAt', 'desc')
];

const mandateQuery = [
  where('type', '==', 'mandate'),
  orderBy('_meta.createdAt', 'desc')
];

@Component({
  selector: 'contracts-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ContractsListComponent {
  public orgId = this.orgService.org.id;
  public exporting = false;

  private mandates$ = this.contractService.valueChanges(mandateQuery).pipe(
    joinWith({
      licensor: (mandate: Mandate) => this.orgService.valueChanges(getSeller(mandate)).pipe(map(org => org?.name)),
      licensee: (mandate: Mandate) => this.orgService.valueChanges(mandate.buyerId).pipe(map(org => org?.name)),
      title: (mandate: Mandate) => this.titleService.valueChanges(mandate.titleId).pipe(map(title => title.title.international)),
    })
  );

  private sales$ = this.contractService.valueChanges(saleQuery).pipe(
    joinWith({
      licensor: (sale: Sale) => this.orgService.valueChanges(getSeller(sale)).pipe(map(org => org?.name)),
      licensee: (sale: Sale) => sale.buyerId ? this.orgService.valueChanges(sale.buyerId).pipe(map(org => org?.name)) : of('External'),
      title: (sale: Sale) => this.titleService.valueChanges(sale.titleId).pipe(map(title => title.title.international)),
      incomes: (sale: Sale) => this.incomeService.valueChanges(incomeQuery(sale.id)), // external sales
      negotiation: (sale: Sale) => this.contractService.adminLastNegotiation(sale.id) // internal sales
    })
  );

  public contracts$ = combineLatest([
    this.mandates$,
    this.sales$
  ]).pipe(map(([mandates, sales]) => ({ mandates, sales, externalSales: sales.filter(s => !s.buyerId) })));

  constructor(
    private contractService: ContractService,
    private orgService: OrganizationService,
    private titleService: MovieService,
    private incomeService: IncomeService,
    private dynTitle: DynamicTitleService,
    private cdr: ChangeDetectorRef,
  ) {
    this.dynTitle.setPageTitle('Mandates and external sales.');
  }

  public exportTable(contracts: { mandates: DetailedContract[], sales: DetailedContract[] }) {
    try {
      this.exporting = true;
      this.cdr.markForCheck();

      const rows = mandatesToExport(contracts.mandates, 'csv').concat(salesToExport(contracts.sales, 'csv'));

      downloadCsvFromJson(rows, 'contract-list');

      this.exporting = false;
    } catch (err) {
      console.log(err);
      this.exporting = false;
    }

    this.cdr.markForCheck();
  }
}
