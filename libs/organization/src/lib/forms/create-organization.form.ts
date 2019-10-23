import { FormControl, Validators } from "@angular/forms";
import { FormEntity, UniqueOrgName } from "@blockframes/utils";
import { createOrganization, Organization } from "../+state";

function createOrganizationFormControl(params?: Organization) {
  const organization = createOrganization(params);
  return {
    name: new FormControl(organization.name, {
      validators: [Validators.required],
      asyncValidators: [UniqueOrgName],
    }),
    phoneNumber: new FormControl(organization.phoneNumber),
    email: new FormControl(organization.email, Validators.email),
    fiscalNumber: new FormControl(organization.fiscalNumber),
    activity: new FormControl(organization.activity),
    logo: new FormControl(organization.logo)
  }
}

export type CreateOrganizationFormControl = ReturnType<typeof createOrganizationFormControl>;

export class CreateOrganizationForm extends FormEntity<CreateOrganizationFormControl> {
  constructor(organization?: Organization) {
    super(createOrganizationFormControl(organization));
  }
}
