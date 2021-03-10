import { Component, ChangeDetectionStrategy, Optional, OnDestroy } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Intercom } from 'ng-intercom';
import { BucketQuery, BucketService } from '@blockframes/contract/bucket/+state';
import { DynamicTitleService } from '@blockframes/utils/dynamic-title/dynamic-title.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'catalog-selection',
  templateUrl: './selection.component.html',
  styleUrls: ['./selection.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MarketplaceSelectionComponent implements OnDestroy {
  private sub: Subscription;
  form = new FormGroup({}); // Todo : transform into a BucketForm


  constructor(
    @Optional() private intercom: Intercom,
    private bucketQuery: BucketQuery,
    private bucketService: BucketService,
    private dynTitle: DynamicTitleService
  ) {
    this.sub = this.bucketQuery.selectActive().subscribe(bucket => {
      this.form.reset(bucket);
      this.setTitle(bucket?.contracts.length);
    });
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
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
