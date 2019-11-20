import { QueryEntity } from '@datorama/akita';
import { Injectable } from '@angular/core';
import { MemberState, MemberStore } from './member.store';
import { Observable, combineLatest } from 'rxjs';
import { PermissionsQuery } from '../../permissions/+state/permissions.query';
import { map } from 'rxjs/operators';
import { OrganizationMember } from './member.model';

@Injectable({
  providedIn: 'root'
})
export class MemberQuery extends QueryEntity<MemberState, OrganizationMember> {
  constructor(protected store: MemberStore, private permissionsQuery: PermissionsQuery) {
    super(store);
  }

  public membersWithRole$: Observable<OrganizationMember[]> = combineLatest([
    this.selectAll(),
    this.permissionsQuery.select()
  ]).pipe(
    map(([members, permissions]) => {
      // Get the role of each member in permissions.roles and add it to member.
      return members.map(member => ({...member, role: permissions.roles[member.uid]}));
    })
  );
}
