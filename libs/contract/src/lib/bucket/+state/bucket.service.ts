import { Injectable } from '@angular/core';
import { CollectionConfig, CollectionService } from 'akita-ng-fire';
import { BucketStore, BucketState } from './bucket.store';
import { Bucket } from './bucket.model';

@Injectable({ providedIn: 'root' })
@CollectionConfig({ path: 'buckets' })
export class BucketService extends CollectionService<BucketState> {

  constructor(
    store: BucketStore
  ) {
    super(store);
  }

  createOffer(bucket: Bucket) {}
}
