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

type OfferStatus = 'offers' | 'on_going_deals' | 'past_deals' | 'all'


const columns = {
  'id': 'CONTRACT REFERENCE',
  'date': 'OFFER CREATED',
  'contracts.length': '# OF TITLES IN PACKAGE',
  'contracts': 'TITLES',
  'specificity': 'SPECIFIC TERMS',
  'status': 'STATUS'
};

type OfferWithContracts = Offer & { contracts: Contract[] };
const queryOffer: Query<OfferWithContracts> = {
  path: 'offers',
  contracts: (offer: Offer) => ({
    path: 'contracts',
    queryFn: ref => ref.where('offerId', '==', offer.id),
  })
}

@Component({
  selector: 'offers-list',
  templateUrl: './offers.component.html',
  styleUrls: ['./offers.component.scss'],
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
    'id', 'date', 'contracts.length', 'contracts', 'specificity', 'status',
  ];
  filter = new FormControl();
  filter$: Observable<OfferStatus | ''> = this.filter.valueChanges.pipe(startWith(this.filter.value || ''));

  constructor(
    private offerService: OfferService,
    private offerQuery: OfferQuery,
    private route: ActivatedRoute,
    private router: Router,

    private routerQuery: RouterQuery,

  ) { }

  goToTitle(offer: Offer) {
    this.router.navigate([offer.id], { relativeTo: this.route });
  }


  /** Dynamic filter of movies for each tab. */
  applyFilter(filter?: OfferStatus) {
    this.filter.setValue(filter);
    // this.dynTitle.setPageTitle(OfferStatus[filter])
  }

  /* index paramter is unused because it is a default paramter from the filter javascript function */
  filterByMovie(offer: Offer, index: number, value): boolean {
    return true;
    // return value ? offer.app.catalog.status === value : true;
  }


}

