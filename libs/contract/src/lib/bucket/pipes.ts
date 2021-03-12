import { NgModule, Pipe, PipeTransform } from '@angular/core';
import { Bucket } from './+state/bucket.model';

@Pipe({ name: 'bucketTotalPrice' })
export class BucketTotalPricePipe implements PipeTransform {
  transform(bucket?: Bucket) {
    if (!bucket?.contracts) return 0;
    return bucket.contracts.reduce((sum, contract) => sum + contract.price, 0);
  }
}

@Pipe({ name: 'bucketTitles' })
export class BucketTitlesPipe implements PipeTransform {
  transform(bucket?: Bucket) {
    if (!bucket?.contracts) return [];
    return Array.from(new Set(bucket.contracts.map(contract => contract.titleId)));
  }
}

@NgModule({
  declarations: [BucketTotalPricePipe, BucketTitlesPipe],
  exports: [BucketTotalPricePipe, BucketTitlesPipe],
})
export class BucketPipesModule {}