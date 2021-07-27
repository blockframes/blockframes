import { Component, ChangeDetectionStrategy } from '@angular/core';
import { ContractService } from '@blockframes/contract/contract/+state';
import { IncomeService } from '@blockframes/contract/income/+state';
import { OfferService } from '@blockframes/contract/offer/+state';
import { OrganizationQuery } from '@blockframes/organization/+state';
import { MovieService } from '@blockframes/movie/+state';
import { joinWith } from '@blockframes/utils/operators';
import { switchMap } from 'rxjs/operators';

@Component({
  selector: 'catalog-offer-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ListComponent {
  offers$ = this.orgQuery.selectActiveId().pipe(
    switchMap(orgId => this.service.valueChanges(ref => ref.where('buyerId', '==', orgId))),
    joinWith({
      contracts: offer => this.getContracts(offer.id)
    }),
  );

  constructor(
    private orgQuery: OrganizationQuery,
    private service: OfferService,
    private contractService: ContractService,
    private incomeService: IncomeService,
    private titleService: MovieService,
  ) { }

  private getContracts(offerId: string) {
    return this.contractService.valueChanges(ref => ref.where('offerId', '==', offerId)).pipe(
      joinWith({
        title: contract => this.titleService.valueChanges(contract.titleId),
        income: contract => this.incomeService.valueChanges(contract.id)
      })
    )
  }
}
