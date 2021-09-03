import { Component, ChangeDetectionStrategy, Optional, Pipe, PipeTransform, OnDestroy } from '@angular/core';
import { Intercom } from 'ng-intercom';
import { Bucket, BucketContract, BucketService } from '@blockframes/contract/bucket/+state';
import { DynamicTitleService } from '@blockframes/utils/dynamic-title/dynamic-title.service';
import { movieCurrencies } from '@blockframes/utils/static-model';
import { Observable, Subject, merge, Subscription } from 'rxjs';
import { debounceTime, map, mapTo, tap } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { SpecificTermsComponent } from './specific-terms/specific-terms.component';
import { Movie } from '@blockframes/movie/+state';
import { OrganizationQuery } from '@blockframes/organization/+state';
import { FormControl } from '@angular/forms';
import { Holdback } from '@blockframes/contract/contract/+state';

@Component({
  selector: 'catalog-selection',
  templateUrl: './selection.component.html',
  styleUrls: ['./selection.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MarketplaceSelectionComponent implements OnDestroy {
  withoutCurrencies = Object.keys(movieCurrencies).filter(currency => currency !== 'EUR' && currency !== 'USD');
  public currencyForm = new FormControl('EUR', { updateOn: 'change' });

  bucket$: Observable<Bucket>;
  private prices: number[] = [];
  priceChanges = new Subject<{ index: number, price: string }>();
  total$: Observable<number>;
  disabled$: Observable<boolean>;
  subs: Subscription[] = [];

  constructor(
    @Optional() private intercom: Intercom,
    private orgQuery: OrganizationQuery,
    private bucketService: BucketService,
    private dialog: MatDialog,
    private dynTitle: DynamicTitleService,
    private snackBar: MatSnackBar
  ) {
    this.bucket$ = this.bucketService.active$.pipe(
      tap(bucket => {
        this.setTitle(bucket?.contracts.length);
        if (bucket?.currency) this.currencyForm.setValue(bucket.currency);
      })
    );

    this.disabled$ = this.bucket$.pipe(
      map(bucket => bucket.contracts.some(contract => !contract.price))
    );

    const bucketPrices$ = this.bucket$.pipe(
      map(bucket => bucket.contracts.map(c => c.price))
    );

    this.total$ = merge(bucketPrices$).pipe(
      map(prices => this.getTotal(prices))
    );

    const sub = this.priceChanges.pipe(
      debounceTime(300)
    ).subscribe((data) => {
      const { index, price } = data;
      if (data)
        this.updatePrice(index, price);
    });

    const sub1 = this.currencyForm.valueChanges.subscribe(currency => {
      const id = this.orgQuery.getActiveId();
      return this.bucketService.update(id, { currency });
    })

    this.subs.push(sub, sub1);
  }

  private setTitle(amount: number) {
    const title = amount ? 'My Selection' : 'No selections yet';
    this.dynTitle.setPageTitle(title);
  }

  private getTotal(prices: number[]) {
    return prices.reduce((arr, curr) => (arr + (curr || 0)), 0)
  }

  trackById(i: number, doc: { id: string }) { return doc.id; }

  updateHoldbacks(index: number, holdbacks: Holdback[]) {
    const id = this.orgQuery.getActiveId();
    this.bucketService.update(id, bucket => {
      const contracts = [...bucket.contracts];
      contracts[index].holdbacks = holdbacks;
      return { contracts };
    });
  }

  updatePrice(index: number, price: string) {
    const id = this.orgQuery.getActiveId();
    const currency = this.currencyForm.value;
    return this.bucketService.update(id, bucket => {
      const contracts = [...bucket.contracts];
      contracts[index].price = parseFloat(price);
      return { contracts, currency };
    });
  }

  setPrice(index: number, price: string | null = "0") {
    const _price = price || "0"; // if "", fallback to '0'
    this.prices[index] = parseFloat(_price);
    this.priceChanges.next({ index, price: _price });
  }


  removeContract(index: number, title: Movie) {
    const id = this.orgQuery.getActiveId();
    delete this.prices[index];
    this.bucketService.update(id, bucket => ({
      contracts: bucket.contracts.filter((_, i) => i !== index)
    }));
    const text = `${title.title.international} was removed from your Selection`;
    this.snackBar.open(text, 'close', { duration: 5000 });
  }

  removeTerm(contractIndex: number, termIndex: number) {
    const id = this.orgQuery.getActiveId();
    this.bucketService.update(id, bucket => {
      const contracts = [...bucket.contracts];
      const terms = contracts[contractIndex].terms.filter((_, i) => i !== termIndex);
      // If there are no terms anymore, remove contract
      if (!terms.length) {
        delete this.prices[contractIndex]
        return {
          contracts: contracts.filter((_, i) => i !== contractIndex)
        };
      }
      // Else update the terms
      contracts[contractIndex].terms = terms;
      return { contracts };
    });
    this.snackBar.open(`Rights deleted`, 'close', { duration: 4000 })
  }

  createOffer(bucket: Bucket) {
    if (bucket.contracts.some(contract => {
      return contract.terms.some((term, index) => {
        const from = term.duration.from.getTime();
        const to = term.duration.to.getTime();

        return contract.terms.some((t, i) => {
          if (i === index) return false;
          const startDuringDuration = from >= t.duration.from.getTime() && from <= t.duration.to.getTime();
          const endDuringDuration = to <= t.duration.to.getTime() && to >= t.duration.from.getTime();
          const wrappedDuration = from <= t.duration.from.getTime() && to >= t.duration.to.getTime();
          const conflictingTime = startDuringDuration || endDuringDuration || wrappedDuration;
          const conflictingMedias = term.medias.some(media => t.medias.includes(media));
          const conflictingTerritories = term.territories.some(territory => t.territories.includes(territory));
          const conflictingExclusive = term.exclusive === t.exclusive;

          return conflictingTime && conflictingMedias && conflictingTerritories && conflictingExclusive
        })

      })
    })) {
      this.snackBar.open('Some terms conflict with each other. Please remove duplicate terms.', '', { duration: 2000 });
    } else {
      this.dialog.open(SpecificTermsComponent, { data: { currency: this.currencyForm.value } });
    }
  }

  openIntercom() {
    this.intercom?.show();
  }

  ngOnDestroy() {
    this.subs.forEach(sub => sub.unsubscribe());
  }

}
