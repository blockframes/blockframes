import { FormControl } from '@angular/forms';
import { FormEntity } from '@blockframes/utils';
import { PLACEHOLDER_LOGO, Organization } from '../+state';

export interface OrganizationProfile {
  officeAddress: string;
  phoneNumber: string;
  logo?: string;
}

function createOrganizationProfile(params: Partial<Organization> = {}): OrganizationProfile {
  return {
    officeAddress: '',
    phoneNumber: '',
    logo: PLACEHOLDER_LOGO,
    ...params
  };
}

function createOrganizationProfileControls(entity: Partial<Organization>) {
  const organizationProfile = createOrganizationProfile(entity);
  return {
    officeAddress: new FormControl(organizationProfile.officeAddress),
    phoneNumber: new FormControl(organizationProfile.phoneNumber),
    logo: new FormControl(organizationProfile.logo),
  };
}

type ProfileControl = ReturnType<typeof createOrganizationProfileControls>;

export class OrganizationProfileForm extends FormEntity<ProfileControl> {
  constructor(data?: Organization) {
    super(createOrganizationProfileControls(data));
  }
}
