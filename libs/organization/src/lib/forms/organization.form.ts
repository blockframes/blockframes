import { FormControl, Validators } from "@angular/forms";
import { FormEntity, UniqueOrgName } from "@blockframes/utils";
import { createOrganization, Organization, OrganizationService } from "../+state";
import { AddressSet, createAddressSet, Address, createAddress } from "@blockframes/organization/types";

export class OrganizationAddressesForm extends FormEntity<OrganizationAddressesControl>{
  constructor(addresses: AddressSet) {
    super(createOrganizationAddressesControls(addresses));
  }

  get main() {
    return this.get('main');
  }
}

function createAddressControls(address: Partial<Address> = {}) {
  const entity = createAddress(address);
  return {
    street: new FormControl(entity.street),
    zipCode: new FormControl(entity.zipCode),
    city: new FormControl(entity.city),
    country: new FormControl(entity.country),
    phoneNumber: new FormControl(entity.phoneNumber),
    region: new FormControl(entity.phoneNumber),
  }
}

type AddressControl = ReturnType<typeof createAddressControls>

export class AddressForm extends FormEntity<AddressControl>{
  constructor(address: Address) {
    super(createAddressControls(address));
  }
}

function createOrganizationFormControl(service: OrganizationService, params?: Organization) {
  const organization = createOrganization(params);
  return {
    name: new FormControl(organization.name, {
      validators: [Validators.required],
      asyncValidators: [UniqueOrgName(service)],
    }),
    addresses: new OrganizationAddressesForm(organization.addresses),
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

  get addresses() {
    return this.get('addresses');
  }
}

function createOrganizationAddressesControls(addresses: Partial<AddressSet> = {}) {
  const entity = createAddressSet(addresses);
  return {
    main: new AddressForm(entity.main)
  }
}

type OrganizationAddressesControl = ReturnType<typeof createOrganizationAddressesControls>


