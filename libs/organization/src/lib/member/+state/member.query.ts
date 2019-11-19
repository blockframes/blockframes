import { QueryEntity } from "@datorama/akita";
import { Injectable } from "@angular/core";
import { MemberState, MemberStore } from "./member.store";
import { Observable, combineLatest } from "rxjs";
import { PermissionsQuery } from "../../permissions/+state";
import { map } from "rxjs/operators";
import { OrganizationMember, UserRole } from "./member.model";

@Injectable({
  providedIn: 'root'
})
export class MemberQuery extends QueryEntity<MemberState, OrganizationMember> {
  constructor(protected store: MemberStore, private permissionsQuery: PermissionsQuery) {
    super(store);
  }

  public membersWithRole$: Observable<OrganizationMember[]> = this.selectAll().pipe(
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
}
