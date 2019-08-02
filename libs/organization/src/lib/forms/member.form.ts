import { FormList } from "@blockframes/utils";
import { OrganizationMember } from "../+state";
import { FormGroup, FormControl } from "@angular/forms";

function createMemberFormGroup(member: OrganizationMember) {
  return new FormGroup({
    uid: new FormControl(member.uid),
    name: new FormControl(member.name),
    surname: new FormControl(member.surname),
    email: new FormControl(member.email),
    role: new FormControl(member.role)
  });
}

export function createMemberFormList() {
  return FormList.factory([], createMemberFormGroup);
}
