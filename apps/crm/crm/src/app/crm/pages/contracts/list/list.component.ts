import { Component, ChangeDetectionStrategy } from '@angular/core';
import { OrganizationService } from '@blockframes/organization/service';
import { DynamicTitleService } from '@blockframes/utils/dynamic-title/dynamic-title.service';
import { ContractService } from '@blockframes/contract/contract/service';
import { IncomeService } from '@blockframes/contract/income/service';
import { MovieService } from '@blockframes/movie/service';
import { joinWith } from 'ngfire';
import { of } from 'rxjs';
import { map } from 'rxjs/operators';
import { getSeller } from '@blockframes/contract/contract/utils'
import { Mandate, Sale } from '@blockframes/model';
import { orderBy, where } from 'firebase/firestore';
import { ActivatedRoute, Router } from '@angular/router';

const query = [
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

  public mandates$ = this.contractService.valueChanges(mandateQuery).pipe(
    joinWith({
      licensor: (mandate: Mandate) => {
        return this.orgService.valueChanges(getSeller(mandate)).pipe(map(org => org.name))
      },
      licensee: (mandate) => this.orgService.valueChanges(mandate.buyerId).pipe(map(org => org.name)),
      title: (mandate: Mandate) => this.titleService.valueChanges(mandate.titleId).pipe(map(title => title.title.international)),
      price: (mandate: Mandate) => this.incomeService.valueChanges(mandate.id),
    })
  );

  public externalSales$ = this.contractService.valueChanges(query).pipe(
    joinWith({
      licensor: (sale: Sale) => {
        return this.orgService.valueChanges(getSeller(sale)).pipe(map(org => org.name))
      },
      licensee: () => of('External'),
      title: (sale: Sale) => this.titleService.valueChanges(sale.titleId).pipe(map(title => title.title.international)),
      price: (sale: Sale) => this.incomeService.valueChanges(sale.id),
    }),
  );

  constructor(
    private contractService: ContractService,
    private orgService: OrganizationService,
    private titleService: MovieService,
    private incomeService: IncomeService,
    private dynTitle: DynamicTitleService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.dynTitle.setPageTitle('My Sales (All)');
  }

  public goToSale(id: string) {
    this.router.navigate([id], { relativeTo: this.route });
  }

  public goToMandate(id: string) {
    this.router.navigate([id], { relativeTo: this.route });
  }

}
