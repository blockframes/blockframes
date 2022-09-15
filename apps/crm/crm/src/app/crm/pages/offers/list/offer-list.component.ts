import { Component, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { ContractService } from '@blockframes/contract/contract/service';
import { OfferService } from '@blockframes/contract/offer/service';
import { MovieService } from '@blockframes/movie/service';
import { joinWith } from 'ngfire';
import { orderBy, where } from 'firebase/firestore';
import { Contract, Movie, Negotiation, Offer, toLabel, sum } from '@blockframes/model';
import { downloadCsvFromJson } from '@blockframes/utils/helpers';
import { format } from 'date-fns';


@Component({
  selector: 'crm-offer-list',
  templateUrl: './offer-list.component.html',
  styleUrls: ['./offer-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OffersListComponent {
  public exporting = false;

  offers$ = this.service.valueChanges([orderBy('_meta.createdAt', 'desc')]).pipe(
    joinWith({
      contracts: offer => this.getContracts(offer.id)
    })
  );
  constructor(
    private service: OfferService,
    private contractService: ContractService,
    private titleService: MovieService,
    private cdr: ChangeDetectorRef,
  ) { }

  private getContracts(offerId: string) {
    return this.contractService.valueChanges([where('offerId', '==', offerId)]).pipe(
      joinWith({
        title: contract => this.titleService.valueChanges(contract.titleId),
        negotiation: contract => this.contractService.adminLastNegotiation(contract.id)
      })
    )
  }

  public exportTable(offers: (
    { contracts: (Contract & { title: Movie, negotiation?: Negotiation })[] }
    & Offer)[]
  ) {
    try {
      this.exporting = true;
      this.cdr.markForCheck();

      const exportedRows = offers.map(offer => ({
        reference: offer.id,
        created: format(offer._meta.createdAt, 'MM/dd/yyyy'),
        buyerId: offer.buyerId,
        '# of title': offer.contracts.length,
        titles: offer.contracts.map(c => c.title?.title?.international).join(', '),
        'specific terms': offer.specificity ? 'yes' : '--',
        'total package price': `${sum(offer.contracts.map(c => c.negotiation.price).filter(value => typeof value === 'number'))} ${offer.currency || ''}`,
        status: toLabel(offer.status, 'offerStatus')
      }));

      downloadCsvFromJson(exportedRows, 'offer-list');

      this.exporting = false;
    } catch (err) {
      console.log(err);
      this.exporting = false;
    }

    this.cdr.markForCheck();
  }
}

