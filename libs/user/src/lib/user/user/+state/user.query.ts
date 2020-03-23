import { QueryEntity } from '@datorama/akita';
import { Injectable } from '@angular/core';
import { UserState, UserStore } from './user.store';
import { Observable, combineLatest } from 'rxjs';
import { PermissionsQuery } from '@blockframes/organization/permissions/+state/permissions.query';
import { map } from 'rxjs/operators';
import { OrganizationMember } from './user.model';

@Injectable({
  providedIn: 'root'
})
export class UserQuery extends QueryEntity<UserState, OrganizationMember> {
  constructor(protected store: UserStore, private permissionsQuery: PermissionsQuery) {
    super(store);
  }

  public membersWithRole$: Observable<OrganizationMember[]> = combineLatest([
    this.selectAll(),
    this.permissionsQuery.selectActive()
  ]).pipe(
    map(([members, permissions]) => {
      // Get the role of each member in permissions.roles and add it to member.
      return members.map(member => ({...member, role: permissions.roles[member.uid]}));
    })
  );
}
