
import { Pipe, PipeTransform, NgModule } from '@angular/core';

import { Term } from '@blockframes/contract/term/+state';
import { getCollidingHoldbacks } from '@blockframes/contract/avails/avails';

import { Holdback } from '../../+state';
import { BucketTerm } from '@blockframes/contract/bucket/+state';

@Pipe({ name: 'collidingHoldbacks' })
export class CollidingHoldbacksPipe implements PipeTransform {
  transform(term: BucketTerm[], holdbacks: Holdback[])
  transform(term: Term[], holdbacks: Holdback[]) {
    return getCollidingHoldbacks(holdbacks, term);
  }
}

@NgModule({
  exports: [CollidingHoldbacksPipe],
  declarations: [CollidingHoldbacksPipe]
})
export class CollidingHoldbacksPipeModule { }
