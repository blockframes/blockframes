import { Component, ChangeDetectionStrategy, OnInit, Input } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { filter, map, shareReplay, startWith } from 'rxjs/operators';
import { FormControl } from '@angular/forms';
import { BehaviorSubject, Observable } from 'rxjs';
import { DynamicTitleService } from '@blockframes/utils/dynamic-title/dynamic-title.service';
import { isInitial } from '@blockframes/contract/negotiation/utils';
import { capitalize } from '@blockframes/utils/helpers';
import { Contract, Sale, Negotiation } from '@blockframes/shared/model';
import { ContractStatus } from '@blockframes/utils/static-model';

interface InternalSale extends Sale<Date> {
  licensor: string;
  licensee: string;
  title: string;
  negotiation: Negotiation<Date>;
}

@Component({
  selector: 'internal-sales-list',
  templateUrl: './internal-sales.component.html',
  styleUrls: ['./internal-sales.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InternalSaleListComponent implements OnInit {
  private title = 'All Sales';

  private _sales = new BehaviorSubject<InternalSale[]>([]);

  filter = new FormControl();
  filter$: Observable<ContractStatus | ''> = this.filter.valueChanges.pipe(startWith(this.filter.value || ''));

  public salesCount$ = this._sales.pipe(
    filter(data => !!data),
    map(m => ({
      all: m.length,
      new: m.filter(m => m.negotiation?.status === 'pending' && isInitial(m.negotiation)).length,
      accepted: m.filter(m => m.negotiation?.status === 'accepted').length,
      declined: m.filter(m => m.negotiation?.status === 'declined').length,
      negotiating: m.filter(m => m.negotiation?.status === 'pending' && !isInitial(m.negotiation)).length,
    })),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  constructor(private router: Router, private dynTitle: DynamicTitleService, private route: ActivatedRoute) {}

  @Input() set sales(sale: InternalSale[]) {
    this._sales.next(sale);
  }

  get sales() {
    return this._sales.value;
  }

  goToSale({ id }: Contract) {
    this.router.navigate([id], { relativeTo: this.route });
  }

  applyFilter(filter?: ContractStatus) {
    this.filter.setValue(filter);
    const titleFilter = filter === 'pending' ? 'new' : filter;
    const pageTitle = `${this.title} (${titleFilter ? capitalize(titleFilter) : 'All'})`;
    this.dynTitle.setPageTitle(pageTitle);
  }

  resetFilter() {
    this.filter.reset('');
    this.dynTitle.setPageTitle(`${this.title} (All)`);
  }

  /* index paramater is unused because it is a default paramater from the filter javascript function */
  filterBySalesStatus(sale: InternalSale, index: number, status: ContractStatus): boolean {
    if (!status) return true;
    if (status === 'negotiating') {
      return sale.status === 'pending' && !isInitial(sale.negotiation);
    }
    if (status === 'pending') {
      return sale.status === 'pending' && isInitial(sale.negotiation);
    }
    return sale.status === status;
  }

  ngOnInit() {
    this.dynTitle.setPageTitle(`${this.title} (All)`);
  }
}
