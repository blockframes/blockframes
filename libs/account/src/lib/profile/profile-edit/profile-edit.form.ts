import { Validators } from '@angular/forms';
import {
  FormEntity,
  EmailControl,
  StringControl
} from '@blockframes/utils';

interface Profile {
  uid: string
  email: string
  firstName: string
  lastName: string
  biography: string
}

function createProfile(params?: Partial<Profile>): Profile {
  return {
    uid: '',
    email: '',
    firstName: '',
    lastName: '',
    biography: '',
    ...(params || {})
  } as Profile
}

function createProfileControls(entity: Partial<Profile>) {
  const profile = createProfile(entity);
  return {
    uid: new StringControl(profile.uid, true),
    email: new EmailControl(profile.email, true),
    firstName: new StringControl(profile.firstName, false, [Validators.required]),
    lastName: new StringControl(profile.lastName, false, [Validators.required]),
    biography: new StringControl(profile.biography),
  }
}

type ProfileControl = ReturnType<typeof createProfileControls>

export class ProfileForm extends FormEntity<Profile, ProfileControl> {
  constructor(data?: Profile) {
    super(createProfileControls(data))
  }
}
