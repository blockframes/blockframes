import { NgModule, Pipe, PipeTransform } from '@angular/core';
import { Bucket } from './+state/bucket.model';

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
  declarations: [BucketTitlesPipe],
  exports: [BucketTitlesPipe],
})
export class BucketPipesModule {}