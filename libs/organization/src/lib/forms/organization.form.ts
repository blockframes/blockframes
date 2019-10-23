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

function createOrganizationEditFormControl(params?: Organization)  {
  const organization = createOrganization(params);
  return {
    phoneNumber: new FormControl(organization.phoneNumber),
    email: new FormControl(organization.email, Validators.email),
    fiscalNumber: new FormControl(organization.fiscalNumber),
    activity: new FormControl(organization.activity),
    logo: new FormControl(organization.logo)
  }
}

export type OrganizationFormControl = ReturnType<typeof createOrganizationFormControl>;

export type OrganizationFormEditControl = ReturnType<typeof createOrganizationEditFormControl>;

export class OrganizationForm extends FormEntity<OrganizationFormControl> {
  constructor(organization?: Organization) {
    super(createOrganizationFormControl(organization));
  }
}

export class OrganizationEditForm extends FormEntity<OrganizationFormEditControl> {
  constructor(organization?: Organization) {
    super(createOrganizationEditFormControl(organization));
  }
}
