import { Injectable } from '@angular/core';
import { Term } from '@blockframes/shared/model';
import { ActiveState, EntityState, EntityStore, StoreConfig } from '@datorama/akita';

export interface TermState extends EntityState<Term, string>, ActiveState<string> {}

@Injectable({ providedIn: 'root' })
@StoreConfig({ name: 'terms' })
export class TermStore extends EntityStore<TermState> {
  constructor() {
    super();
  }
}
