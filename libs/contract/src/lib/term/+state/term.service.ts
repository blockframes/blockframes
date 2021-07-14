import { Injectable } from '@angular/core'
import { CollectionService, CollectionConfig } from 'akita-ng-fire';
import { Term } from './term.model';
import { TermState, TermStore } from './term.store'

@Injectable({ providedIn: 'root' })
@CollectionConfig({ path: 'terms' })
export class TermService extends CollectionService<TermState> {
  useMemorization=true;

  constructor(store: TermStore) {
    super(store)
  }

  formatFromFirestore(term): Term<Date> {
    if (term.duration?.from) term.duration.from = term.duration.from.toDate();
    if (term.duration?.to) term.duration.to = term.duration.to.toDate();
    return term;
  }
}
