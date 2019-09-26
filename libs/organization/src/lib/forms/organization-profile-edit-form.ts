import { FormControl } from '@angular/forms';
import { FormEntity } from '@blockframes/utils/form';
import { PLACEHOLDER_LOGO } from '../+state';

export interface OrganizationProfile {
  address: string;
  phoneNumber: string;
  logo?: string;
}

function createOrganizationProfile(params: Partial<OrganizationProfile> = {}): OrganizationProfile {
  return {
    address: '',
    phoneNumber: '',
    logo: PLACEHOLDER_LOGO,
    ...params
  };
}

function createOrganizationProfileControls(entity: Partial<OrganizationProfile>) {
  const organizationProfile = createOrganizationProfile(entity);
  return {
    address: new FormControl(organizationProfile.address),
    phoneNumber: new FormControl(organizationProfile.phoneNumber),
    logo: new FormControl(organizationProfile.logo),
  };
}

type ProfileControl = ReturnType<typeof createOrganizationProfileControls>;

export class OrganizationProfileForm extends FormEntity<OrganizationProfile, ProfileControl> {
  constructor(data?: OrganizationProfile) {
    super(createOrganizationProfileControls(data));
  }
}
