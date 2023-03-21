import { UntypedFormControl, Validators } from "@angular/forms";
import { createAddressSet } from "@blockframes/model";
import { FormEntity } from "@blockframes/utils/form";
import { OrganizationAddressesForm } from "./organization.form";

function createOrganizationLiteFormControl() {
  return {
    name: new UntypedFormControl('', Validators.required),
    addresses: new OrganizationAddressesForm(createAddressSet()),
    activity: new UntypedFormControl('', Validators.required),
    appAccess: new UntypedFormControl('', Validators.required),
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

