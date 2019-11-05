import { FormControl, Validators } from "@angular/forms";
import { FormEntity, UniqueOrgName, FireQuery } from "@blockframes/utils";
import { createOrganization, Organization } from "../+state";

function createOrganizationFormControl(db: FireQuery, params?: Organization) {
  const organization = createOrganization(params);
  return {
    name: new FormControl(organization.name, {
      validators: [Validators.required],
      asyncValidators: [UniqueOrgName.bind(db)],
    }),
    phoneNumber: new FormControl(organization.phoneNumber),
    email: new FormControl(organization.email, Validators.email),
    fiscalNumber: new FormControl(organization.fiscalNumber),
    activity: new FormControl(organization.activity),
    logo: new FormControl(organization.logo)
  }
}

export type OrganizationFormControl = ReturnType<typeof createOrganizationFormControl>;

export class OrganizationForm extends FormEntity<OrganizationFormControl> {
  constructor(private db: FireQuery, organization?: Organization) {
    super(createOrganizationFormControl(db, organization));
  }
}
