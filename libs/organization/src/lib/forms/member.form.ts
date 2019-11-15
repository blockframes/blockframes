import { FormList } from "@blockframes/utils";
import { FormGroup, FormControl } from "@angular/forms";
import { OrganizationMember } from "../member/+state/member.model";

function createMemberFormGroup(member: OrganizationMember) {
  return new FormGroup({
    uid: new FormControl(member.uid),
    name: new FormControl(member.name),
    surname: new FormControl(member.surname),
    email: new FormControl(member.email),
    role: new FormControl(member.role),
    avatar: new FormControl(member.avatar)
  });
}

export function createMemberFormList() {
  return FormList.factory([], createMemberFormGroup);
}
