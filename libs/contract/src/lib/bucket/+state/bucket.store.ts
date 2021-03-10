import { Injectable } from '@angular/core';
import { Bucket } from './bucket.model';
import { EntityState, ActiveState, EntityStore, StoreConfig } from '@datorama/akita';

export interface BucketState extends EntityState<Bucket>, ActiveState<string> { }

@Injectable({ providedIn: 'root' })
@StoreConfig({ name: 'buckets' })
export class BucketStore extends EntityStore<BucketState> {

  constructor() {
    super();
  }

}

