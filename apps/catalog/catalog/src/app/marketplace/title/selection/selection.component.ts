import { Component, ChangeDetectionStrategy, Optional } from '@angular/core';
import { Intercom } from 'ng-intercom';
import { Bucket, BucketQuery, BucketService } from '@blockframes/contract/bucket/+state';
import { DynamicTitleService } from '@blockframes/utils/dynamic-title/dynamic-title.service';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Component({
  selector: 'catalog-selection',
  templateUrl: './selection.component.html',
  styleUrls: ['./selection.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MarketplaceSelectionComponent {

  bucket$: Observable<Bucket>;

  constructor(
    @Optional() private intercom: Intercom,
    private bucketQuery: BucketQuery,
    private bucketService: BucketService,
    private dynTitle: DynamicTitleService
  ) {
    this.bucket$ = this.bucketQuery.selectActive().pipe(
      tap(bucket => this.setTitle(bucket?.contracts.length)),
    );
  }

  private setTitle(amount: number) {
    const title = amount ? 'My Selection' : 'No selections yet';
    this.dynTitle.setPageTitle(title);
  }

  updateCurrency(currency: Bucket['currency']) {
    const id = this.bucketQuery.getActiveId();
    this.bucketService.update(id, { currency });
  }

  updatePrice(index: number, price: number) {
    const id = this.bucketQuery.getActiveId();
    this.bucketService.update(id, bucket => {
      const contracts = [ ...bucket.contracts ];
      contracts[index].price = price;
      return { contracts };
    });
  }

  removeTerm(contractIndex: number, termIndex: number) {
    const id = this.bucketQuery.getActiveId();
    this.bucketService.update(id, bucket => {
      const contracts = [ ...bucket.contracts ];
      const terms = contracts[contractIndex].terms.filter((_, i) => i !== termIndex);
      // If there are no terms anymore, remove contract
      if (!terms.length) return { contracts: contracts.filter((_, i) => i !== contractIndex) };
      // Else update the terms
      contracts[contractIndex].terms = terms;
      return { contracts };
    });
  }

  createOffer() {
    this.bucketService.createOffer();
  }

  openIntercom() {
    this.intercom?.show();
  }
}
