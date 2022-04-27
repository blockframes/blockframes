import { Injectable } from '@angular/core'
import { Term } from '@blockframes/model';
import { BlockframesCollection } from '@blockframes/utils/abstract-service';

@Injectable({ providedIn: 'root' })
export class TermService extends BlockframesCollection<Term> {
  readonly path = 'terms';
}
