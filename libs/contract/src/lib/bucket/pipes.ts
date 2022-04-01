import { NgModule, Pipe, PipeTransform } from '@angular/core';
import { Bucket } from '@blockframes/shared/model';

@Pipe({ name: 'bucketTotalPrice' })
export class BucketTotalPricePipe implements PipeTransform {
  transform(bucket?: Bucket) {
    if (!bucket?.contracts) return 0;
    return bucket.contracts.reduce((sum, contract) => sum + contract.price, 0);
  }
}

@Pipe({ name: 'bucketTitles' })
export class BucketTitlesPipe implements PipeTransform {

  result: string[] = [];

  transform(bucket?: Bucket) {
    if (!bucket?.contracts?.length) return [];
    const result = Array.from(new Set(bucket.contracts.map(contract => contract.titleId)));
    if (this.result.length !== result.length || !result.every(id => this.result.includes(id))) {
      this.result = result;
    }
    return this.result;
  }
}

@NgModule({
  declarations: [BucketTotalPricePipe, BucketTitlesPipe],
  exports: [BucketTotalPricePipe, BucketTitlesPipe],
})
export class BucketPipesModule {}