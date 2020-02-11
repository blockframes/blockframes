import { FormControl, Validators } from "@angular/forms";
import { FormEntity, UniqueOrgName, FormList } from "@blockframes/utils";
import { createOrganization, Organization, OrganizationService } from "../+state";
import { AddressSet, createAddressSet } from "@blockframes/organization/types";
import { Location, createLocation, BankAccount, createBankAccount } from '@blockframes/utils/common-interfaces/utility';

export class OrganizationAddressesForm extends FormEntity<OrganizationAddressesControl>{
  constructor(addressSet: AddressSet) {
    super(createOrganizationAddressesControls(addressSet));
  }

  get main() {
    return this.get('main');
  }
}

function createLoactionControls(location: Partial<Location> = {}) {
  const entity = createLocation(location);
  return {
    street: new FormControl(entity.street),
    zipCode: new FormControl(entity.zipCode),
    city: new FormControl(entity.city),
    country: new FormControl(entity.country),
    phoneNumber: new FormControl(entity.phoneNumber),
    region: new FormControl(entity.phoneNumber),
  }
}

type LocationControl = ReturnType<typeof createLoactionControls>

export class AddressForm extends FormEntity<LocationControl>{
  constructor(location: Location) {
    super(createLoactionControls(location));
  }
}

function createOrganizationFormControl(service: OrganizationService, params?: Organization) {
  const organization = createOrganization(params);
  return {
    name: new FormControl(organization.name, {
      validators: [Validators.required],
      asyncValidators: [UniqueOrgName(service, name)],
    }),
    addresses: new OrganizationAddressesForm(organization.addresses),
    email: new FormControl(organization.email, Validators.email),
    fiscalNumber: new FormControl(organization.fiscalNumber),
    activity: new FormControl(organization.activity),
    logo: new FormControl(organization.logo),
    bankAccounts: FormList.factory(organization.bankAccounts, el => new OrganizationBankAccountForm(el))
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


function createOrganizationBankAccountFormControl(account: Partial<BankAccount>) {
  const entity = createBankAccount(account);
  return {
    address: new AddressForm(entity.address),
    IBAN: new FormControl(entity.IBAN),
    BIC: new FormControl(entity.BIC),
    name: new FormControl(entity.name),
  }
}

export type OrganizationBankAccountFormControl = ReturnType<typeof createOrganizationBankAccountFormControl>;

export class OrganizationBankAccountForm extends FormEntity<OrganizationBankAccountFormControl> {
  constructor(account: Partial<BankAccount>) {
    super(createOrganizationBankAccountFormControl(account));
  }
}