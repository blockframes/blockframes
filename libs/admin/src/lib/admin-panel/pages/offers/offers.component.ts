import {
  Component, ChangeDetectionStrategy, OnDestroy,
} from '@angular/core';
import { ContractService } from '@blockframes/contract/contract/+state';
import { Offer, OfferQuery, OfferService } from '@blockframes/contract/offer/+state';
import { queryChanges, Query } from "akita-ng-fire";
import { Subscription } from 'rxjs';
import { Observable } from 'rxjs/internal/Observable';

@Component({
  selector: 'offers',
  templateUrl: './offers.component.html',
  styleUrls: ['./offers.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OffersComponent implements OnDestroy {

  subs: Subscription[] = [];
  offers = queryChanges.call(this.offerService, {
    path: 'offers',
    //@ts-ignore
    contracts: (offer: Offer) => ({
      path: 'contracts',
      queryFn: ref => ref.where('offerId', '==', offer.id)
    })
  });
  constructor(
    private offerService: OfferService,
    private offerQuery: OfferQuery,
  ) { }

  ngOnDestroy() {
    this.subs.forEach(s => s.unsubscribe());
  }

}

