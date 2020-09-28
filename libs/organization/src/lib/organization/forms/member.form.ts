import { FormList } from "@blockframes/utils/form/forms/list.form";
import { FormGroup, FormControl, Validators } from "@angular/forms";
import { OrganizationMember } from "@blockframes/user/+state/user.model";

function createMemberFormGroup(member: Partial<OrganizationMember> = {}) {
  return new FormGroup({
    uid: new FormControl(member.uid),
    firstName: new FormControl(member.firstName),
    lastName: new FormControl(member.lastName),
    email: new FormControl(member.email, Validators.email),
    role: new FormControl(member.role),
    avatar: new FormControl(member.avatar)
  });
}

export function createMemberFormList() {
  return FormList.factory([], createMemberFormGroup);
}
