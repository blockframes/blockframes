import { Validators, FormControl } from '@angular/forms';
import {
  FormEntity,
  EmailControl,
} from '@blockframes/utils';

export interface Profile {
  name: string,
  surname: string,
  phoneNumber: string;
  position: string;
}

function createProfile(params?: Partial<Profile>): Profile {
  return {
    name: '',
    surname: '',
    phoneNumber: '',
    position: '',
    ...(params || {})
  } as Profile
}

function createProfileControls(entity: Partial<Profile>) {
  const profile = createProfile(entity);
  return {
    name: new FormControl(profile.name, Validators.minLength(3)),
    surname: new FormControl(profile.name, Validators.minLength(3)),
    phoneNumber: new FormControl(profile.phoneNumber),
    position: new FormControl(profile.position)
  }
}

type ProfileControl = ReturnType<typeof createProfileControls>

export class ProfileForm extends FormEntity<Profile, ProfileControl> {
  constructor(data?: Profile) {
    super(createProfileControls(data))
  }
}
