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
import { Observable } from 'rxjs';
import { OrganizationMember, UserRole } from '../member/+state/member.model';
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

  // TODO: this query does not change correctly when a member is updated: issue#707
  public membersWithRole$: Observable<OrganizationMember[]> = this.memberQuery.selectAll().pipe(
  map(orgMembers => {
    return orgMembers.map(orgMember => {
      const permissions = this.permissionsQuery.getValue();
      let userRole: UserRole;
      switch (true) {
        case permissions.superAdmins.includes(orgMember.uid):
          userRole = UserRole.superAdmin;
          break;
        case permissions.admins.includes(orgMember.uid):
          userRole = UserRole.admin;
          break;
        case permissions.members.includes(orgMember.uid):
          userRole = UserRole.member;
          break;
        default:
          throw new Error(`Member ${orgMember.name} ${orgMember.surname} with id ${orgMember.uid} has no role.`);
      }
      return {
        ...orgMember,
        role: userRole
      };
    });
  })
  );

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
