import { Injectable } from '@angular/core'
import { CollectionService, CollectionConfig } from 'akita-ng-fire';
import { Term } from './term.model';
import { TermStore } from './term.store'

@Injectable({ providedIn: 'root' })
@CollectionConfig({ path: 'terms' })
export class TermService extends CollectionService<Term<Date>> {
  constructor(store: TermStore) {
    super(store)
  }
}
