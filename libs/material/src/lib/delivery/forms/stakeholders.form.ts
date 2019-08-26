import { FormList } from "@blockframes/utils";
import { FormGroup, FormControl } from "@angular/forms";
import { Organization } from "@blockframes/organization";

function createOrganizationFormGroup(organization: Organization) {
  return new FormGroup({
    id: new FormControl(organization.id),
    name: new FormControl(organization.name)
  });
}

export function createOrganizationFormList() {
  return FormList.factory([], createOrganizationFormGroup);
}
