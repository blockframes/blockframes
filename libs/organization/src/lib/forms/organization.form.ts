import { FormControl, Validators } from "@angular/forms";
import { FormEntity, UniqueOrgName } from "@blockframes/utils";
import { createOrganization, Organization, OrganizationService } from "../+state";

function createOrganizationFormControl(service: OrganizationService, params?: Organization) {
  const organization = createOrganization(params);
  return {
    name: new FormControl(organization.name, {
      validators: [Validators.required],
      asyncValidators: [UniqueOrgName(service)],
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
  constructor(service: OrganizationService, organization?: Organization) {
    super(createOrganizationFormControl(service, organization));
  }
}
