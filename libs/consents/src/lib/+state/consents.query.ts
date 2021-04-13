import { Injectable } from '@angular/core';
import { QueryEntity } from '@datorama/akita';
import { map } from 'rxjs/operators';
import { Access } from './consents.firestore';
import { ConsentsState, ConsentsStore } from './consents.store';

@Injectable({ providedIn: 'root' })
export class ConsentsQuery extends QueryEntity<ConsentsState, Access<Date>> {
  selectId$ = this.select(state => state.id).pipe(map(id => !!id));
  constructor(protected store: ConsentsStore) {
    super(store);
  }

  get userId() {
    return this.getValue().userId;
  }
}
