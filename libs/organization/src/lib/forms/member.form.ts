import { FormList } from "@blockframes/utils";
import { FormGroup, FormControl, Validators } from "@angular/forms";
import { OrganizationMember } from "../member/+state/member.model";

function createMemberFormGroup(member: Partial<OrganizationMember> = {}) {
  return new FormGroup({
    uid: new FormControl(member.uid),
    name: new FormControl(member.name),
    surname: new FormControl(member.surname),
    email: new FormControl(member.email),
    role: new FormControl(member.role),
    avatar: new FormControl(member.avatar)
  });
}

function createAddMemberFormGroup() {
  return new FormGroup({
    email: new FormControl('', Validators.email),
    role: new FormControl(),
  });
}

export function createMemberFormList() {
  return FormList.factory([], createMemberFormGroup);
}

export function createAddMemberFormList() {
  return FormList.factory([], createAddMemberFormGroup);
}
