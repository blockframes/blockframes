import { Injectable } from '@angular/core'
import { CollectionService, CollectionConfig } from 'akita-ng-fire';
import { TermState, TermStore } from './term.store'
import { toDate } from '@blockframes/utils/helpers';
import { Term } from '@blockframes/model';

@Injectable({ providedIn: 'root' })
@CollectionConfig({ path: 'terms' })
export class TermService extends CollectionService<TermState> {
  useMemorization = true;

  constructor(store: TermStore) {
    super(store)
  }

  formatFromFirestore(term): Term<Date> {
    if (term?.duration?.from) term.duration.from = toDate(term.duration.from);
    if (term?.duration?.to) term.duration.to = toDate(term.duration.to);
    return term;
  }
}
