import { Component, ChangeDetectionStrategy } from '@angular/core';
import { OfferService } from '@blockframes/contract/offer/+state';

@Component({
  selector: 'crm-offer-list',
  templateUrl: './offer-list.component.html',
  styleUrls: ['./offer-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OffersListComponent {

  offers$ = this.service.queryWithContracts();
  constructor(private service: OfferService) { }

}

