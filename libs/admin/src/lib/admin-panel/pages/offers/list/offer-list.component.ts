import {
  Component, ChangeDetectionStrategy,
} from '@angular/core';
import { Offer, OfferService } from '@blockframes/contract/offer/+state';
import { RouterQuery } from '@datorama/akita-ng-router-store';
import { Query, queryChanges } from "akita-ng-fire";
import { Observable } from 'rxjs';
import { appName, getCurrentApp } from '@blockframes/utils/apps';
import { FormControl } from '@angular/forms';
import { startWith } from 'rxjs/operators';
import { Contract } from '@blockframes/contract/contract/+state';
import { Income } from '@blockframes/contract/income/+state';


const columns = {
  'id': 'Offer Reference',
  '_meta.createdAt': 'Offer created',
  'contracts.length': '# Of Titles In Package',
  'contracts': 'Titles',
  'specificity': 'Specific Terms',
  'incomes': 'Total Package Price',
  'status': 'Status'
};

type OfferWithContracts = Offer & { contracts: Contract[], incomes: Income[] };
const queryOffer: Query<OfferWithContracts> = {
  path: 'offers',
  contracts: (offer: Offer) => ({
    path: 'contracts',
    queryFn: ref => ref.where('offerId', '==', offer.id),
  }),
  incomes: (offer: Offer) => ({
    path: 'incomes',
    queryFn: ref => ref.where('offerId', '==', offer.id)
  })
}

type AllOfferStatus = '' | 'pending' | 'on_going' | 'past_deals';
@Component({
  selector: 'offers-list',
  templateUrl: './offer-list.component.html',
  styleUrls: ['./offer-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OffersListComponent {

  offers$ = queryChanges.call(this.offerService, queryOffer);
  app = getCurrentApp(this.routerQuery);
  appName = appName[this.app];
  columns = columns;
  initialColumns = [
    'id', '_meta.createdAt', 'contracts.length', 'contracts', 'specificity', 'incomes', 'status',
  ];
  filter = new FormControl('');
  filter$: Observable<AllOfferStatus> = this.filter.valueChanges.pipe(startWith(this.filter.value ?? ''));

  constructor(
    private offerService: OfferService,
    private routerQuery: RouterQuery,
  ) { }

  /** Dynamic filter of offers for each tab. */
  applyFilter(filter?: AllOfferStatus) {
    this.filter.setValue(filter);
  }

  /* index paramter is unused because it is a default paramter from the filter javascript function */
  filterByStatus(offer: Offer, index: number, value: AllOfferStatus): boolean {
    switch (value) {
      case 'pending':
        return offer.status === value;
      case 'on_going':
        return ["negotiating", "accepted", "signing"].includes(offer.status);
      case 'past_deals':
        return ["signed", "declined"].includes(offer.status);
      default:
        return true;
    }
  }
}

