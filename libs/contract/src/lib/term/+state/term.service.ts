import { Injectable } from '@angular/core'
import { CollectionService, CollectionConfig } from 'akita-ng-fire';
import { Term } from './term.model';
import { TermState, TermStore } from './term.store'

@Injectable({ providedIn: 'root' })
@CollectionConfig({ path: 'terms' })
export class TermService extends CollectionService<TermState> {
  constructor(store: TermStore) {
    super(store)
  }

  formatFromFirestore(term): Term<Date> {
    term.duration.from = term.duration.from.toDate();
    term.duration.to = term.duration.to.toDate();
    return term;
  }
}
