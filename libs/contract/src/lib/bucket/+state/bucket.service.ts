import { Injectable } from '@angular/core';
import { BucketStore, BucketState } from './bucket.store';
import { CollectionConfig, CollectionService } from 'akita-ng-fire';

@Injectable({ providedIn: 'root' })
@CollectionConfig({ path: 'buckets' })
export class BucketService extends CollectionService<BucketState> {

  constructor(
    store: BucketStore
  ) {
    super(store);
  }
}
