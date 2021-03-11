import { Component, ChangeDetectionStrategy, Optional } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Intercom } from 'ng-intercom';
import { Bucket, BucketQuery, BucketService } from '@blockframes/contract/bucket/+state';
import { DynamicTitleService } from '@blockframes/utils/dynamic-title/dynamic-title.service';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';

@Component({
  selector: 'catalog-selection',
  templateUrl: './selection.component.html',
  styleUrls: ['./selection.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MarketplaceSelectionComponent {

  form = new FormGroup({}); // Todo : transform into a BucketForm

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

  createOffer() {
    this.bucketService.createOffer();
  }

  openIntercom() {
    this.intercom?.show();
  }
}
