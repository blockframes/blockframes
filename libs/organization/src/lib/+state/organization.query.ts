import { Injectable } from '@angular/core';
import { QueryEntity } from '@datorama/akita';
import { OrganizationState, OrganizationStore } from './organization.store';
import {
  OrganizationStatus,
  Organization
} from './organization.model';
import { filter, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class OrganizationQuery extends QueryEntity<OrganizationState, Organization> {
  constructor(
    protected store: OrganizationStore
    ) {
    super(store);
  }

  public isAccepted$ = this.selectActive().pipe(
    filter(org => !!org),
    map(org => org.status === OrganizationStatus.accepted)
  )

  public pendingActions$ = this.selectActive(org => org.actions).pipe(
    filter(actions => !!actions),
    map(actions => actions.filter(action => !action.isApproved))
  );


  public approvedActions$ =  this.selectActive(org => org.actions).pipe(
    filter(actions => !!actions),
    map(actions => actions.filter(action => action.isApproved))
  );


  public getOperationById(id: string) {
    return this.getActive().operations.filter(action => action.id === id)[0];
  }
}
