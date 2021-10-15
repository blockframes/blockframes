
import { Pipe, PipeTransform, NgModule } from '@angular/core';

import { BucketTerm } from '@blockframes/contract/term/+state';
import { getCollidingHoldbacks } from '@blockframes/contract/avails/avails';

import { Holdback } from '../../+state';

@Pipe({ name: 'collidingHoldbacks' })
export class CollidingHoldbacksPipe implements PipeTransform {
  transform(term: BucketTerm | BucketTerm[], holdbacks: Holdback[]) {
    return getCollidingHoldbacks(holdbacks, Array.isArray(term) ? term : [term]);
  }
}

@NgModule({
  exports: [CollidingHoldbacksPipe],
  declarations: [CollidingHoldbacksPipe]
})
export class CollidingHoldbacksPipeModule { }
