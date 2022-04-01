import { FormControl, Validators } from '@angular/forms';
import { FormStaticValue, FormEntity } from '@blockframes/utils/form';
import { AddressSet, createAddressSet, createOrganization, Organization } from '@blockframes/shared/model';
import { Location, createLocation } from '@blockframes/utils/common-interfaces/utility';
import { StorageFileForm } from '@blockframes/media/form/media.form';
import { OrganizationMediasForm } from './medias.form';

export class OrganizationAddressesForm extends FormEntity<OrganizationAddressesControl> {
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
    country: new FormStaticValue<'territories'>(entity.country, 'territories', [Validators.required]),
    phoneNumber: new FormControl(entity.phoneNumber),
    region: new FormControl(entity.phoneNumber),
  };
}

type LocationControl = ReturnType<typeof createLoactionControls>;

export class AddressForm extends FormEntity<LocationControl> {
  constructor(location: Location) {
    super(createLoactionControls(location));
  }
}

function createOrganizationFormControl(params?: Organization) {
  const organization = createOrganization(params);
  return {
    denomination: new OrganizationDenominationForm(organization.denomination),
    description: new FormControl(organization.description),
    addresses: new OrganizationAddressesForm(organization.addresses),
    email: new FormControl(organization.email, Validators.email),
    fiscalNumber: new FormControl(organization.fiscalNumber),
    activity: new FormControl(organization.activity),
    logo: new StorageFileForm(organization.logo),
    documents: new OrganizationMediasForm(organization.documents),
  };
}

export type OrganizationFormControl = ReturnType<typeof createOrganizationFormControl>;

export class OrganizationForm extends FormEntity<OrganizationFormControl> {
  constructor(organization?: Organization) {
    super(createOrganizationFormControl(organization));
  }

  get addresses() {
    return this.get('addresses');
  }

  get logo() {
    return this.get('logo');
  }
}

function createOrganizationAddressesControls(addresses: Partial<AddressSet> = {}) {
  const entity = createAddressSet(addresses);
  return {
    main: new AddressForm(entity.main),
  };
}

type OrganizationAddressesControl = ReturnType<typeof createOrganizationAddressesControls>;

// Denomination form
function createDenominationFormControl(denomination) {
  return {
    full: new FormControl(denomination.full, Validators.required),
    // TODO #2860 implements denomination.public
    public: new FormControl(denomination.public),
  };
}

export type OrganizationDenominationFormControl = ReturnType<typeof createDenominationFormControl>;

export class OrganizationDenominationForm extends FormEntity<OrganizationDenominationFormControl> {
  constructor(denomination) {
    super(createDenominationFormControl(denomination));
  }
}
