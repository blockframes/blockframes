import { Component, ChangeDetectionStrategy } from '@angular/core';
import { OrganizationService } from '@blockframes/organization/service';
import { DynamicTitleService } from '@blockframes/utils/dynamic-title/dynamic-title.service';
import { ContractService } from '@blockframes/contract/contract/service';
import { IncomeService } from '@blockframes/contract/income/service';
import { MovieService } from '@blockframes/movie/service';
import { joinWith } from 'ngfire';
import { combineLatest, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { getSeller } from '@blockframes/contract/contract/utils'
import { Mandate, Sale } from '@blockframes/model';
import { orderBy, where } from 'firebase/firestore';

const externalSaleQuery = [
  where('buyerId', '==', ''),
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

  private mandates$ = this.contractService.valueChanges(mandateQuery).pipe(
    joinWith({
      licensor: (mandate: Mandate) => {
        return this.orgService.valueChanges(getSeller(mandate)).pipe(map(org => org.name))
      },
      licensee: (mandate) => this.orgService.valueChanges(mandate.buyerId).pipe(map(org => org?.name)),
      title: (mandate: Mandate) => this.titleService.valueChanges(mandate.titleId).pipe(map(title => title.title.international)),
      price: (mandate: Mandate) => this.incomeService.valueChanges(mandate.id),
    })
  );

  private externalSales$ = this.contractService.valueChanges(externalSaleQuery).pipe(
    joinWith({
      licensor: (sale: Sale) => {
        return this.orgService.valueChanges(getSeller(sale)).pipe(map(org => org.name))
      },
      licensee: () => of('External'),
      title: (sale: Sale) => this.titleService.valueChanges(sale.titleId).pipe(map(title => title.title.international)),
      price: (sale: Sale) => this.incomeService.valueChanges(sale.id),
    }),
  );

  public contracts$ = combineLatest([
    this.mandates$,
    this.externalSales$
  ]).pipe(map(([mandates, sales]) => ({ mandates, sales })));

  constructor(
    private contractService: ContractService,
    private orgService: OrganizationService,
    private titleService: MovieService,
    private incomeService: IncomeService,
    private dynTitle: DynamicTitleService,
  ) {
    this.dynTitle.setPageTitle('Mandates and external sales.');
  }
}