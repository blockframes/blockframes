import { FormControl } from '@angular/forms';
import { FormEntity } from '@blockframes/utils';

export interface OrganizationProfile {
  address: string;
  phoneNumber: string;
}

function createOrganizationProfile(params: Partial<OrganizationProfile> = {}): OrganizationProfile {
  return {
    address: '',
    phoneNumber: '',
    ...params
  };
}

function createOrganizationProfileControls(entity: Partial<OrganizationProfile>) {
  const organizationProfile = createOrganizationProfile(entity);
  return {
    address: new FormControl(organizationProfile.address),
    phoneNumber: new FormControl(organizationProfile.phoneNumber),
  };
}

type ProfileControl = ReturnType<typeof createOrganizationProfileControls>;

export class OrganizationProfileForm extends FormEntity<OrganizationProfile, ProfileControl> {
  constructor(data?: OrganizationProfile) {
    super(createOrganizationProfileControls(data));
  }
}
