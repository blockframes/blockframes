import { QueryEntity } from '@datorama/akita';
import { Injectable } from '@angular/core';
import { UserState, UserStore } from './user.store';
import { Observable, combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';
import { OrganizationMember } from './user.model';
import { PermissionsService } from '@blockframes/permissions/+state';

@Injectable({
  providedIn: 'root'
})
export class UserQuery extends QueryEntity<UserState, OrganizationMember> {
  constructor(protected store: UserStore, private permissionsService: PermissionsService) { // @TODO #7285 this cause circular dependencies but should be resolved once UserQuery will be removed
    super(store);
  }

  public membersWithRole$: Observable<OrganizationMember[]> = combineLatest([
    this.selectAll(),
    this.permissionsService.permissions$
  ]).pipe(
    map(([members, permissions]) => {
      // Get the role of each member in permissions.roles and add it to member.
      return members.map(member => ({...member, role: permissions.roles[member.uid]}));
    })
  );
}
