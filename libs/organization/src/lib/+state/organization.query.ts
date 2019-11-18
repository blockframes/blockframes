import { Injectable } from '@angular/core';
import { QueryEntity } from '@datorama/akita';
import { OrganizationState, OrganizationStore } from './organization.store';
import {
  OrganizationStatus,
  Organization
} from './organization.model';
import { filter, map } from 'rxjs/operators';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class OrganizationQuery extends QueryEntity<OrganizationState, Organization> {
  constructor(
    protected store: OrganizationStore
    ) {
    super(store);
  }

  public isAccepted$ = this.selectAll().pipe(
    filter(orgs => !!orgs[0]),
    map(orgs => orgs[0].status === OrganizationStatus.accepted)
  )

  get orgId$(): Observable<string> {
    return this.selectActive(org => org.id);
  }

  get id() {
    return this.getActiveId()
  }

  get pendingActions$() {
    return this.selectActive(org => org.actions).pipe(
      filter(actions => !!actions),
      map(actions => actions.filter(action => !action.isApproved))
    );
  }

  get approvedActions$() {
    return this.selectActive(org => org.actions).pipe(
      filter(actions => !!actions),
      map(actions => actions.filter(action => action.isApproved))
    );
  }

  getOperationById(id: string) {
    return this.getActive().operations.filter(action => action.id === id)[0];
  }
}
