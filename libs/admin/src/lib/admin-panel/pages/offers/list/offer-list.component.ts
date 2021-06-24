import {
  Component, ChangeDetectionStrategy,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Offer, OfferQuery, OfferService } from '@blockframes/contract/offer/+state';
import { RouterQuery } from '@datorama/akita-ng-router-store';
import { Query, queryChanges } from "akita-ng-fire";
import { Observable } from 'rxjs';
import { appName, getCurrentApp } from '@blockframes/utils/apps';
import { FormControl } from '@angular/forms';
import { startWith, tap } from 'rxjs/operators';
import { Contract } from '@blockframes/contract/contract/+state';
import { Income } from '@blockframes/contract/income/+state';

type OfferStatus = 'offers' | 'pending' | 'signed' | 'all'


const columns = {
  'id': 'CONTRACT REFERENCE',
  'date': 'OFFER CREATED',
  'contracts.length': '# OF TITLES IN PACKAGE',
  'contracts': 'TITLES',
  'specificity': 'SPECIFIC TERMS',
  'incomes': 'TOTAL PACKAGE PRICE',
  'status': 'STATUS'
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

@Component({
  selector: 'offers-list',
  templateUrl: './offer-list.component.html',
  styleUrls: ['./offer-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OffersComponent {

  offers$ = queryChanges.call(this.offerService, queryOffer)
    .pipe(
      tap(s => console.log({ s }))
    );
  public app = getCurrentApp(this.routerQuery);
  public appName = appName[this.app];
  columns = columns;
  initialColumns = [
    'id', 'date', 'contracts.length', 'contracts', 'specificity', 'incomes', 'status',
  ];
  filter = new FormControl('all');
  filter$: Observable<OfferStatus | ''> = this.filter.valueChanges.pipe(startWith(this.filter.value || ''));

  constructor(
    private offerService: OfferService,
    private offerQuery: OfferQuery,
    private route: ActivatedRoute,
    private router: Router,

    private routerQuery: RouterQuery,

  ) { }

  goToOffer(offer: Offer) {
    this.router.navigate([`../offer/${offer.id}`], { relativeTo: this.route });
  }


  /** Dynamic filter of offers for each tab. */
  applyFilter(filter?: OfferStatus) {
    this.filter.setValue(filter);
  }

  /* index paramter is unused because it is a default paramter from the filter javascript function */
  filterByStatus(offer: Offer, index: number, value: OfferStatus): boolean {
    if (value === 'all') { return true; }
    return value ? offer.status === value : true;
  }


}

