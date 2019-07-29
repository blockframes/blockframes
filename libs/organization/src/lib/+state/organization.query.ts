import { Injectable } from '@angular/core';
import { Query } from '@datorama/akita';
import { OrganizationState, OrganizationStore } from './organization.store';
import { OrganizationStatus } from './organization.model';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class OrganizationQuery extends Query<OrganizationState> {
  constructor(protected store: OrganizationStore) {
    super(store);
  }

  get status$(): Observable<OrganizationStatus> {
    return this.select(state => state.org).pipe(
      filter(org => !!org),
      map(org => org.status)
    );
  }

  get form$() {
    return this.select(state => state.form);
  }

  get pendingActions$() {
    return this.select(state => state.org.actions.filter(action => !action.isApproved));
  }

  get approvedActions$() {
    return this.select(state => state.org.actions.filter(action => !action.isApproved));
  }

  getOperationById(id: string) {
    return this.getValue().org.operations.filter(action => action.id === id)[0];
  }
}
