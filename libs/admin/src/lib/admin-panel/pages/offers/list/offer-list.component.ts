import { Component, ChangeDetectionStrategy } from '@angular/core';
import { ContractService } from '@blockframes/contract/contract/+state';
import { IncomeService } from '@blockframes/contract/income/+state';
import { OfferService } from '@blockframes/contract/offer/+state';
import { joinWith } from '@blockframes/utils/operators';

@Component({
  selector: 'crm-offer-list',
  templateUrl: './offer-list.component.html',
  styleUrls: ['./offer-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OffersListComponent {

  offers$ = this.service.valueChanges().pipe(
    joinWith({
      contracts: offer => this.getContracts(offer.id)
    })
  );
  constructor(
    private service: OfferService,
    private contractService: ContractService,
    private incomeService: IncomeService
  ) { }

  private getContracts(offerId: string) {
    return this.contractService.valueChanges(ref => ref.where('offerId', '==', offerId)).pipe(
      joinWith({
        income: contract => this.incomeService.valueChanges(contract.id)
      })
    )
  }
}

