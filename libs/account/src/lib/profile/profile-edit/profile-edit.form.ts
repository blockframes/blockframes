import { Validators } from '@angular/forms';
import {
  EntityControl,
  EntityForm,
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

function createProfileControls(entity: Partial<Profile>): EntityControl<Profile> {
  const profile = createProfile(entity);
  return {
    uid: new StringControl(profile.uid, true),
    email: new EmailControl(profile.email, true),
    firstName: new StringControl(profile.firstName, false, [Validators.required]),
    lastName: new StringControl(profile.lastName, false, [Validators.required]),
    biography: new StringControl(profile.biography),
  }
}


export class ProfileForm extends EntityForm<Profile> {
  constructor(data?: Profile) {
    super(createProfileControls(data))
  }
}
