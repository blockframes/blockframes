import { Injectable } from '@angular/core';
import { Query } from '@datorama/akita';
import { filter, map } from 'rxjs/operators';
import { Dao } from './dao.model';
import { DaoStore } from './dao.store';

@Injectable({
  providedIn: 'root'
})
export class DaoQuery extends Query<Dao> {
  constructor(protected store: DaoStore) {
    super(store);
  }

  public pendingActions$ = this.select(dao => dao.actions).pipe(
    filter(actions => !!actions),
    map(actions => actions.filter(action => !action.isApproved))
  );

  public approvedActions$ = this.select(dao => dao.actions).pipe(
    filter(actions => !!actions),
    map(actions => actions.filter(action => action.isApproved))
  );

  public getOperationById(id: string) {
    return this.getValue().operations.find(action => action.id === id);
  }
}
