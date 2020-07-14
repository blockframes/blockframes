import { FormControl, Validators } from "@angular/forms";
import { FormEntity } from "@blockframes/utils/form";
import { createOrganization, Organization } from "../+state";
import { AddressSet, createAddressSet } from "@blockframes/organization/+state/organization.firestore";
import { Location, createLocation } from '@blockframes/utils/common-interfaces/utility';
import { FormStaticValue } from '@blockframes/utils/form';
import { ImgRefForm } from '@blockframes/media/form/image-reference.form'

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
    country: new FormStaticValue(entity.country, 'TERRITORIES'),
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

function createOrganizationFormControl(params?: Organization) {
  const organization = createOrganization(params);
  return {
    denomination: new OrganizationDenominationForm(organization.denomination),
    addresses: new OrganizationAddressesForm(organization.addresses),
    email: new FormControl(organization.email, Validators.email),
    fiscalNumber: new FormControl(organization.fiscalNumber),
    activity: new FormControl(organization.activity),
    logo: new ImgRefForm(organization.logo),
    // ISSUE#2692
    // bankAccounts: FormList.factory(organization.bankAccounts, el => new OrganizationBankAccountForm(el))
  }
}

export type OrganizationFormControl = ReturnType<typeof createOrganizationFormControl>;

export class OrganizationForm extends FormEntity<OrganizationFormControl> {
  constructor(organization?: Organization) {
    super(createOrganizationFormControl(organization));
  }

  get addresses() {
    return this.get('addresses');
  }

  get logo() { return this.get('logo'); }
}

function createOrganizationAddressesControls(addresses: Partial<AddressSet> = {}) {
  const entity = createAddressSet(addresses);
  return {
    main: new AddressForm(entity.main)
  }
}

type OrganizationAddressesControl = ReturnType<typeof createOrganizationAddressesControls>

// ISSUE#2692
// function createOrganizationBankAccountFormControl(account?: Partial<BankAccount>) {
//   const entity = createBankAccount(account);
//   return {
//     address: new AddressForm(entity.address),
//     IBAN: new FormControl(entity.IBAN),
//     BIC: new FormControl(entity.BIC),
//     name: new FormControl(entity.name),
//     holderName: new FormControl(entity.holderName)
//   }
// }

// export type OrganizationBankAccountFormControl = ReturnType<typeof createOrganizationBankAccountFormControl>;

// export class OrganizationBankAccountForm extends FormEntity<OrganizationBankAccountFormControl> {
//   constructor(account?: Partial<BankAccount>) {
//     super(createOrganizationBankAccountFormControl(account));
//   }
// }

// Denomination form
function createDenominationFormControl(denomination) {
  return {
    full: new FormControl(denomination.full, Validators.required),
    // TODO #2860 implements denomination.public
    public: new FormControl(denomination.public)
  }
}

export type OrganizationDenominationFormControl = ReturnType<typeof createDenominationFormControl>;

export class OrganizationDenominationForm extends FormEntity<OrganizationDenominationFormControl> {
  constructor(denomination) {
    super(createDenominationFormControl(denomination));
  }
}
