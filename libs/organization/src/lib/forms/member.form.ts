import { FormList } from "@blockframes/utils";
import { OrganizationMemberWithRole } from "../+state";
import { FormGroup, FormControl } from "@angular/forms";

function createMemberFormGroup(member: OrganizationMemberWithRole) {
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
