import { UntypedFormControl, Validators } from '@angular/forms';
import { FormStaticValue, FormEntity } from '@blockframes/utils/form';
import { AddressSet, createAddressSet, createOrganization, Organization, Location, createLocation } from '@blockframes/model';
import { StorageFileForm } from '@blockframes/media/form/media.form';
import { OrganizationMediasForm } from './medias.form';

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
    street: new UntypedFormControl(entity.street),
    zipCode: new UntypedFormControl(entity.zipCode),
    city: new UntypedFormControl(entity.city),
    country: new FormStaticValue<'territories'>(entity.country, 'territories', [Validators.required]),
    phoneNumber: new UntypedFormControl(entity.phoneNumber),
    region: new UntypedFormControl(entity.phoneNumber),
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
    name: new UntypedFormControl(organization.name, Validators.required),
    description: new UntypedFormControl(organization.description),
    addresses: new OrganizationAddressesForm(organization.addresses),
    email: new UntypedFormControl(organization.email, Validators.email),
    activity: new UntypedFormControl(organization.activity),
    logo: new StorageFileForm(organization.logo),
    documents: new OrganizationMediasForm(organization.documents),
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
