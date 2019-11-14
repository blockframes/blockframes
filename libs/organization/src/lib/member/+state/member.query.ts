import { QueryEntity } from "@datorama/akita";
import { Injectable } from "@angular/core";
import { MemberState, MemberStore } from "./member.store";
import { Observable, combineLatest } from "rxjs";
import { PermissionsQuery } from "../../permissions/+state";
import { map } from "rxjs/operators";
import { OrganizationMember, UserRole } from "../../+state";


@Injectable({
  providedIn: 'root'
})
export class MemberQuery extends QueryEntity<MemberState, OrganizationMember> {
  constructor(protected store: MemberStore, private permissionsQuery: PermissionsQuery) {
    super(store);
  }

  public membersWithRole$: Observable<OrganizationMember[]> = combineLatest([
    this.selectAll(),
    this.permissionsQuery.superAdmins$
  ]).pipe(
    map(([members, superAdmins]) => {
      return members.map(member => ({
        ...member,
        role: superAdmins.includes(member.uid) ? UserRole.admin : UserRole.member
      }));
    })
  );
}
