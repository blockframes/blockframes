
import { Pipe, PipeTransform, NgModule } from '@angular/core';

import { Term } from '@blockframes/contract/term/+state';
import { getCollidingHoldbacks } from '@blockframes/contract/avails/avails';

import { Holdback } from '../../+state';

@Pipe({ name: 'collidingHoldbacks' })
export class CollidingHoldbacksPipe implements PipeTransform {
  transform(term: Term, holdbacks: Holdback[]) {
    return getCollidingHoldbacks(holdbacks, [term]);
  }
}

@NgModule({
  exports: [CollidingHoldbacksPipe],
  declarations: [CollidingHoldbacksPipe]
})
export class CollidingHoldbacksPipeModule { }
