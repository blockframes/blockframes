import { Component, ChangeDetectionStrategy, Optional } from '@angular/core';
import { Intercom } from 'ng-intercom';
import { Bucket, BucketQuery, BucketService } from '@blockframes/contract/bucket/+state';
import { DynamicTitleService } from '@blockframes/utils/dynamic-title/dynamic-title.service';
import { MovieCurrency, movieCurrencies, Scope } from '@blockframes/utils/static-model';
import { Observable, Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, map, mapTo, tap } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { SpecificTermsComponent } from './specific-terms/specific-terms.component';
import { DetailedTermsComponent } from '@blockframes/contract/term/components/detailed/detailed.component';
import { Movie } from '@blockframes/movie/+state';

@Component({
  selector: 'catalog-selection',
  templateUrl: './selection.component.html',
  styleUrls: ['./selection.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MarketplaceSelectionComponent {
  currencies = movieCurrencies;
  columns = {
    duration: 'Terms',
    territories: 'Territories',
    medias: 'Rights',
    exclusive: 'Exclusivity'
  };
  initialColumns = ['duration', 'territories', 'medias', 'exclusive', 'action'];
  bucket$: Observable<Bucket>;
  private prices: number[] = [];
  priceChanges = new Subject();
  total$ = this.priceChanges.pipe(
    debounceTime(100),
    map(value => {
      console.log(value)
      return this.getTotal(this.prices)
    }),
    distinctUntilChanged(),
  );

  trackById = (i: number, doc: { id: string }) => doc.id;

  constructor(
    @Optional() private intercom: Intercom,
    private bucketQuery: BucketQuery,
    private bucketService: BucketService,
    private dialog: MatDialog,
    private dynTitle: DynamicTitleService,
    private snackBar: MatSnackBar
  ) {
    this.bucket$ = this.bucketQuery.selectActive().pipe(
      tap(bucket => {
        this.setTitle(bucket?.contracts.length)
        bucket?.contracts.forEach((contract, i) => this.setPrice(i, contract.price))
      }),
    );
  }

  private setTitle(amount: number) {
    const title = amount ? 'My Selection' : 'No selections yet';
    this.dynTitle.setPageTitle(title);
  }

  private getTotal(prices) {
    return prices.reduce((arr, curr) => (arr + curr), 0)
  }

  updateCurrency(currency: MovieCurrency) {
    const id = this.bucketQuery.getActiveId();
    this.bucketService.update(id, { currency });
  }

  setPrice(i: number, price: number | string) {
    this.prices[i] = +price;
    this.priceChanges.next();
  }


  async updatePrice(index: number, price: string) {
    const id = this.bucketQuery.getActiveId();
    await this.bucketService.update(id, bucket => {
      const contracts = [...bucket.contracts];
      contracts[index].price = +price;
      return { contracts };
    });
  }

  removeContract(index: number, title: Movie) {
    const id = this.bucketQuery.getActiveId();
    delete this.prices[index];
    this.bucketService.update(id, bucket => ({
      contracts: bucket.contracts.filter((_, i) => i !== index)
    }));
    const text = `${title.title.international} was removed from your Selection`;
    this.snackBar.open(text, 'close', { duration: 5000 });
  }

  removeTerm(contractIndex: number, termIndex: number) {
    const id = this.bucketQuery.getActiveId();
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
    } else if (bucket.contracts.some(contract => !contract.price || contract.price < 0)) {
      this.snackBar.open('Missing price information.', '', { duration: 2000 });
    } else {
      this.dialog.open(SpecificTermsComponent);
    }
  }

  openIntercom() {
    this.intercom?.show();
  }

  openDetails(terms: string, scope: Scope) {
    this.dialog.open(DetailedTermsComponent, { data: { terms, scope } });
  }
}
