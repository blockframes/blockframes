import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { Offer } from '@blockframes/contract/offer/+state';
import { RouterQuery } from '@datorama/akita-ng-router-store';
import { Observable } from 'rxjs';
import { appName, getCurrentApp } from '@blockframes/utils/apps';
import { FormControl } from '@angular/forms';
import { startWith } from 'rxjs/operators';

const columns = {
  'id': 'Offer Reference',
  '_meta.createdAt': 'Offer created',
  'contracts.length': '# Of Titles In Package',
  'contracts': 'Titles',
  'specificity': 'Specific Terms',
  'incomes': 'Total Package Price',
  'status': 'Status'
};
const initialColumns = Object.keys(columns);

type AllOfferStatus = '' | 'pending' | 'on_going' | 'past_deals';

@Component({
  selector: 'offer-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ListComponent {

  @Input() offers?: null | Offer[];
  app = getCurrentApp(this.routerQuery);
  appName = appName[this.app];
  columns = columns;
  initialColumns = initialColumns;
  filter = new FormControl('');
  filter$: Observable<AllOfferStatus> = this.filter.valueChanges.pipe(startWith(this.filter.value ?? ''));

  constructor(private routerQuery: RouterQuery,) { }

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
