import { FormControl, Validators } from "@angular/forms";
import { FormEntity } from "@blockframes/utils/form";
import { createOrganization, Organization } from "../+state";
import { OrganizationAddressesForm, OrganizationDenominationForm } from "./organization.form";

function createOrganizationLiteFormControl(params?: Organization) {
  const organization = createOrganization(params);
  return {
    denomination: new OrganizationDenominationForm(organization.denomination),
    addresses: new OrganizationAddressesForm(organization.addresses),
    activity: new FormControl(organization.activity, Validators.required),
    marketplace: new FormControl(organization.appAccess.festival.marketplace, Validators.required),
  }
}

export type OrganizationLiteFormControl = ReturnType<typeof createOrganizationLiteFormControl>;

export class OrganizationLiteForm extends FormEntity<OrganizationLiteFormControl> {
  constructor(organization?: Organization) {
    super(createOrganizationLiteFormControl(organization));
  }

  get addresses() {
    return this.get('addresses');
  }

}

