import { FormControl, Validators } from "@angular/forms";
import { createAddressSet, createDenomination } from "@blockframes/model";
import { FormEntity } from "@blockframes/utils/form";
import { OrganizationAddressesForm, OrganizationDenominationForm } from "./organization.form";

function createOrganizationLiteFormControl() {
  return {
    denomination: new OrganizationDenominationForm(createDenomination()),
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

