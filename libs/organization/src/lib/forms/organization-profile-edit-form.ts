import { FormControl } from '@angular/forms';
import { FormEntity } from '@blockframes/utils';
import { PLACEHOLDER_LOGO, Organization } from '../+state';

export interface OrganizationProfile {
  officeAddress: string;
  phoneNumber: string;
  fiscalNumber: string;
  activity: string;
  logo?: string;
}

function createOrganizationProfile(params: Partial<Organization> = {}): OrganizationProfile {
  return {
    officeAddress: '',
    phoneNumber: '',
    fiscalNumber: '',
    activity: '',
    logo: PLACEHOLDER_LOGO,
    ...params
  };
}

function createOrganizationProfileControls(entity: Partial<Organization>) {
  const organizationProfile = createOrganizationProfile(entity);
  return {
    officeAddress: new FormControl(organizationProfile.officeAddress),
    phoneNumber: new FormControl(organizationProfile.phoneNumber),
    fiscalNumber: new FormControl(organizationProfile.fiscalNumber),
    activity: new FormControl(organizationProfile.activity),
    logo: new FormControl(organizationProfile.logo),
  };
}

type ProfileControl = ReturnType<typeof createOrganizationProfileControls>;

export class OrganizationProfileForm extends FormEntity<ProfileControl> {
  constructor(data?: Organization) {
    super(createOrganizationProfileControls(data));
  }
}
