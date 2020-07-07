import { FormControl, FormGroup } from '@angular/forms';
import { User } from '@blockframes/auth/+state/auth.store';
import { createImgRef, ImgRef } from '@blockframes/media/+state/media.firestore';
import { FormEntity } from '@blockframes/utils/form/forms/entity.form';
import { ImgRefForm } from '@blockframes/media/directives/image-reference/image-reference.form';

export interface Profile {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  position: string;
  avatar: ImgRef;
  email: string;
}

export function createProfile(params: Partial<User> = {}): Profile {
  return {
    firstName: '',
    lastName: '',
    phoneNumber: '',
    position: '',
    email: '',
    ...params,
    avatar: createImgRef(params.avatar),
  };
}

function createProfileControls(entity: Partial<User>) {
  const profile = createProfile(entity);
  return {
    firstName: new FormControl(profile.firstName),
    lastName: new FormControl(profile.lastName),
    phoneNumber: new FormControl(profile.phoneNumber),
    position: new FormControl(profile.position),
    avatar: new ImgRefForm(profile.avatar),
    email: new FormControl({ value: profile.email, disabled: true })
  };
}

export type ProfileControl = ReturnType<typeof createProfileControls>;

export class ProfileForm extends FormEntity<ProfileControl, User> {
  constructor(profile?: Profile) {
    super(createProfileControls(profile));
  }

  get avatar() { return this.get('avatar'); }
}
