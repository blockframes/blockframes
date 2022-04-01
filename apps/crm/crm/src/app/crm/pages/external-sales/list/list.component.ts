import { Component, ChangeDetectionStrategy } from '@angular/core';
import { OrganizationService } from '@blockframes/organization/+state';
import { DynamicTitleService } from '@blockframes/utils/dynamic-title/dynamic-title.service';
import { CollectionReference } from '@angular/fire/firestore';
import { ContractService } from '@blockframes/contract/contract/+state';
import { IncomeService } from '@blockframes/contract/income/+state';
import { MovieService } from '@blockframes/movie/+state/movie.service';
import { joinWith } from '@blockframes/utils/operators';
import { of } from 'rxjs';
import { map } from 'rxjs/operators';
import { getSeller } from '@blockframes/contract/contract/+state/utils';
import { Organization, Sale } from '@blockframes/shared/model';

const queryFn = (ref: CollectionReference) => {
  return ref.where('buyerId', '==', '').where('type', '==', 'sale').orderBy('_meta.createdAt', 'desc');
};

function getFullName(seller: Organization) {
  return seller.denomination.full;
}

@Component({
  selector: 'contracts-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ContractsListComponent {
  public orgId = this.orgService.org.id;

  public externalSales$ = this.contractService.valueChanges(queryFn).pipe(
    joinWith({
      licensor: (sale: Sale) => {
        return this.orgService.valueChanges(getSeller(sale)).pipe(map(getFullName));
      },
      licensee: () => of('External'),
      title: (sale: Sale) => this.titleService.valueChanges(sale.titleId).pipe(map(title => title.title.international)),
      price: (sale: Sale) => this.incomeService.valueChanges(sale.id),
    })
  );

  constructor(
    private contractService: ContractService,
    private orgService: OrganizationService,
    private titleService: MovieService,
    private incomeService: IncomeService,
    private dynTitle: DynamicTitleService
  ) {
    this.dynTitle.setPageTitle('My Sales (All)');
  }
}
