import { FormControl, Validators } from "@angular/forms";
import { createAddressSet } from "@blockframes/model";
import { FormEntity } from "@blockframes/utils/form";
import { OrganizationAddressesForm } from "./organization.form";

function createOrganizationLiteFormControl() {
  return {
    name: new FormControl('', Validators.required),
    addresses: new OrganizationAddressesForm(createAddressSet()),
    activity: new FormControl('', Validators.required),
    appAccess: new FormControl('', Validators.required),
  }
}

export type OrganizationLiteFormControl = ReturnType<typeof createOrganizationLiteFormControl>;

export class OrganizationLiteForm extends FormEntity<OrganizationLiteFormControl> {
  constructor() {
    super(createOrganizationLiteFormControl());
  }

  get addresses() {
    return this.get('addresses');
  }

}

