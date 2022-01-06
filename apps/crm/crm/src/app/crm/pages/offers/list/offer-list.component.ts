import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CollectionReference } from '@angular/fire/firestore';
import { ContractService } from '@blockframes/contract/contract/+state';
import { OfferService } from '@blockframes/contract/offer/+state';
import { MovieService } from '@blockframes/movie/+state';
import { joinWith } from '@blockframes/utils/operators';


@Component({
  selector: 'crm-offer-list',
  templateUrl: './offer-list.component.html',
  styleUrls: ['./offer-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OffersListComponent {

  offers$ = this.service.valueChanges(ref => ref.orderBy('_meta.createdAt', 'desc')).pipe(
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
    const queryContracts = (ref: CollectionReference) => ref.where('offerId', '==', offerId);
    return this.contractService.valueChanges(queryContracts).pipe(
      joinWith({
        title: contract => this.titleService.valueChanges(contract.titleId),
        negotiation: contract => this.contractService.adminLastNegotiation(contract.id)
      })
    )
  }
}

