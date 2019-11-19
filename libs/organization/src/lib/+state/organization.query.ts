import { Injectable } from '@angular/core';
import { QueryEntity } from '@datorama/akita';
import { OrganizationState, OrganizationStore } from './organization.store';
import {
  OrganizationStatus,
  Organization
} from './organization.model';
import { filter, map } from 'rxjs/operators';
import { PermissionsQuery } from '../permissions/+state/permissions.query';
import { FireQuery } from '@blockframes/utils/firequery/firequery';
import { MemberQuery } from '../member/+state/member.query';

@Injectable({
  providedIn: 'root'
})
export class OrganizationQuery extends QueryEntity<OrganizationState, Organization> {
  constructor(
    protected store: OrganizationStore,
    private permissionsQuery: PermissionsQuery,
    private memberQuery: MemberQuery,
    protected db: FireQuery
    ) {
    super(store);
  }

  /**
   * An Observable that describe the list
   * of application that are accessible to the current
   * organization.
  */
  public appsDetails$ = this.select(state => state.appsDetails);

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
    return this.getActive().operations.find(action => action.id === id);
  }
}
