import { Component, ChangeDetectionStrategy, Optional } from '@angular/core';
import { Intercom } from 'ng-intercom';
import { Bucket, BucketQuery, BucketService } from '@blockframes/contract/bucket/+state';
import { DynamicTitleService } from '@blockframes/utils/dynamic-title/dynamic-title.service';
import { MovieCurrency, movieCurrencies } from '@blockframes/utils/static-model';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { SpecificTermsComponent } from './specific-terms/specific-terms.component';

@Component({
  selector: 'catalog-selection',
  templateUrl: './selection.component.html',
  styleUrls: ['./selection.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MarketplaceSelectionComponent {
  trackById = (i: number, doc: { id: string }) => doc.id;
  currencies = movieCurrencies;
  columns = {
    duration: 'Terms',
    territories: 'Territories',
    medias: 'Rights',
    exclusive: 'Exclusivity'
  };
  initialColumns = ['duration', 'territories', 'medias', 'exclusive', 'action'];
  bucket$: Observable<Bucket>;

  constructor(
    @Optional() private intercom: Intercom,
    private bucketQuery: BucketQuery,
    private bucketService: BucketService,
    private dialog: MatDialog,
    private dynTitle: DynamicTitleService,
    private snackBar: MatSnackBar
  ) {
    this.bucket$ = this.bucketQuery.selectActive().pipe(
      tap(bucket => this.setTitle(bucket?.contracts.length)),
    );
  }

  private setTitle(amount: number) {
    const title = amount ? 'My Selection' : 'No selections yet';
    this.dynTitle.setPageTitle(title);
  }

  updateCurrency(currency: MovieCurrency) {
    const id = this.bucketQuery.getActiveId();
    this.bucketService.update(id, { currency });
  }

  updatePrice(index: number, price: string) {
    const id = this.bucketQuery.getActiveId();
    this.bucketService.update(id, bucket => {
      const contracts = [ ...bucket.contracts ];
      contracts[index].price = +price;
      return { contracts };
    });
  }

  removeContract(index: number) {
    const id = this.bucketQuery.getActiveId();
    this.bucketService.update(id, bucket => ({
      contracts: bucket.contracts.filter((_, i) => i !== index)
    }));
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

  createOffer(bucket: Bucket) {
    if (bucket.contracts.some(contract => !contract.price || contract.price < 0)) {
      this.snackBar.open('Please add price on every item', '', { duration: 2000 });
    } else {
      this.dialog.open(SpecificTermsComponent);
    }
  }

  openIntercom() {
    this.intercom?.show();
  }
}
