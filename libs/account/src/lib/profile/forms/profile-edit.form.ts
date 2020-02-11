import { FormControl } from '@angular/forms';
import { FormEntity } from '@blockframes/utils';
import { User } from '@blockframes/auth/+state/auth.store';
export interface Profile {
  name: string;
  surname: string;
  phoneNumber: string;
  position: string;
  avatar: string;
  email: string;
}

export function createProfile(params: Partial<User> = {}): Profile {
  return {
    name: '',
    surname: '',
    phoneNumber: '',
    position: '',
    avatar: '',
    email: '',
    ...params
  };
}

function createProfileControls(entity: Partial<User>) {
  const profile = createProfile(entity);
  return {
    name: new FormControl(profile.name),
    surname: new FormControl(profile.surname),
    phoneNumber: new FormControl(profile.phoneNumber),
    position: new FormControl(profile.position),
    avatar: new FormControl(profile.avatar),
    email: new FormControl(profile.email)
  };
}

export type ProfileControl = ReturnType<typeof createProfileControls>;

export class ProfileForm extends FormEntity<ProfileControl, User> {
  constructor(profile?: Profile) {
    super(createProfileControls(profile));
  }
}
