import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { Observable } from 'rxjs';
import { FormControl } from '@angular/forms';
import { startWith } from 'rxjs/operators';
import { Contract, Movie, Negotiation, Offer } from '@blockframes/shared/model';
import { DynamicTitleService } from '@blockframes/utils/dynamic-title/dynamic-title.service';
import { ActivatedRoute, Router } from '@angular/router';

type AllOfferStatus = '' | 'pending' | 'on_going' | 'past_deals';

interface ContractView extends Contract {
  title: Movie;
  negotiation: Negotiation;
}
interface OfferView extends Offer {
  contracts: ContractView[];
}

@Component({
  selector: 'offer-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ListComponent {
  @Input() offers?: null | OfferView[];
  filter = new FormControl('');
  filter$: Observable<AllOfferStatus> = this.filter.valueChanges.pipe(startWith(this.filter.value ?? ''));

  constructor(private router: Router, private route: ActivatedRoute, private dynTitle: DynamicTitleService) {
    this.dynTitle.setPageTitle('Offers & Deals');
  }

  /** Dynamic filter of offers for each tab. */
  applyFilter(filter?: AllOfferStatus) {
    this.filter.setValue(filter);
  }

  filterByStatus(offer: Offer, _: number, value: AllOfferStatus): boolean {
    switch (value) {
      case 'pending':
        return offer.status === value;
      case 'on_going':
        return ['negotiating', 'accepted', 'signing'].includes(offer.status);
      case 'past_deals':
        return ['signed', 'declined'].includes(offer.status);
      default:
        return true;
    }
  }

  rowClick({ id }: { id: string }) {
    this.router.navigate([id], { relativeTo: this.route });
  }
}
