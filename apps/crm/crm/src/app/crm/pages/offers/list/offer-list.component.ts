import { Component, ChangeDetectionStrategy } from '@angular/core';
import { ContractService } from '@blockframes/contract/contract/service';
import { OfferService } from '@blockframes/contract/offer/service';
import { MovieService } from '@blockframes/movie/service';
import { joinWith } from 'ngfire';
import { orderBy, where } from 'firebase/firestore';


@Component({
  selector: 'crm-offer-list',
  templateUrl: './offer-list.component.html',
  styleUrls: ['./offer-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OffersListComponent {

  offers$ = this.service.valueChanges([orderBy('_meta.createdAt', 'desc')]).pipe(
    joinWith({
      contracts: offer => this.getContracts(offer.id)
    })
  );
  constructor(
    private service: OfferService,
    private contractService: ContractService,
    private titleService: MovieService,
  ) { }

  private getContracts(offerId: string) {
    return this.contractService.valueChanges([where('offerId', '==', offerId)]).pipe(
      joinWith({
        title: contract => this.titleService.valueChanges(contract.titleId),
        negotiation: contract => this.contractService.adminLastNegotiation(contract.id)
      })
    )
  }
}

