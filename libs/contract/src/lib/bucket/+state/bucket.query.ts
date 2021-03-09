import { Injectable } from '@angular/core';
import { QueryEntity } from '@datorama/akita';
import { BucketStore, BucketState } from './bucket.store';

@Injectable({ providedIn: 'root' })
export class BucketQuery extends QueryEntity<BucketState> {

  constructor(protected store: BucketStore) {
    super(store);
  }
}
