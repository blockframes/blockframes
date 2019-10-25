import { FormControl } from '@angular/forms';
import { FormEntity } from '@blockframes/utils';
import { PLACEHOLDER_AVATAR } from '@blockframes/auth';

export interface Profile {
  name: string;
  surname: string;
  phoneNumber: string;
  position: string;
  avatar: string;
}

export function createProfile(params: Partial<Profile> = {}): Profile {
  return {
    name: '',
    surname: '',
    phoneNumber: '',
    position: '',
    avatar: '',
    ...params
  };
}

function createProfileControls(entity: Partial<Profile>) {
  const profile = createProfile(entity);
  return {
    name: new FormControl(profile.name),
    surname: new FormControl(profile.surname),
    phoneNumber: new FormControl(profile.phoneNumber),
    position: new FormControl(profile.position),
    avatar: new FormControl(profile.avatar)
  };
}

type ProfileControl = ReturnType<typeof createProfileControls>;

export class ProfileForm extends FormEntity<ProfileControl> {
  constructor(data?: Profile) {
    super(createProfileControls(data));
  }
}
