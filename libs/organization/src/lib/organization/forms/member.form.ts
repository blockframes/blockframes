import { FormList } from "@blockframes/utils/form/forms/list.form";
import { FormGroup, FormControl, Validators } from "@angular/forms";
import { OrganizationMember } from "@blockframes/user/+state/user.model";

function createMemberFormGroup(member: Partial<OrganizationMember> = {}) {
  return new FormGroup({
    uid: new FormControl(member.uid),
    name: new FormControl(member.name),
    surname: new FormControl(member.surname),
    email: new FormControl(member.email, Validators.email),
    role: new FormControl(member.role),
    avatar: new FormControl(member.avatar)
  });
}

function createAddMemberFormGroup() {
  return new FormControl('', [Validators.required, Validators.email]);

}

export function createMemberFormList() {
  return FormList.factory([], createMemberFormGroup);
}

export function createAddMemberFormList() {
  return FormList.factory([], createAddMemberFormGroup);
}
