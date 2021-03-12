import { NgModule, Pipe, PipeTransform } from '@angular/core';
import { Bucket } from './+state/bucket.model';

@Pipe({ name: 'bucketTotalPrice' })
export class BucketTotalPrice implements PipeTransform {
  transform(bucket?: Bucket) {
    if (!bucket?.contracts) return 0;
    return bucket.contracts.reduce((sum, contract) => sum + contract.price, 0);
  }
}

@NgModule({
  declarations: [BucketTotalPrice],
  exports: [BucketTotalPrice],
})
export class BucketPipesModule {}