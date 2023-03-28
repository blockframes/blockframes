import { UntypedFormControl } from '@angular/forms';
import { FormEntity } from '@blockframes/utils/form/forms/entity.form';
import { StorageFileForm } from '@blockframes/media/form/media.form';
import { createStorageFile, StorageFile, User } from '@blockframes/model';

export interface Profile {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  position: string;
  avatar: StorageFile;
  email: string;
  hideEmail: boolean
}

export function createProfile(params: Partial<User> = {}): Profile {
  return {
    firstName: '',
    lastName: '',
    phoneNumber: '',
    position: '',
    email: '',
    hideEmail: false,
    ...params,
    avatar: createStorageFile(params?.avatar),
  };
}

function createProfileControls(entity: Partial<User>) {
  const profile = createProfile(entity);
  return {
    firstName: new UntypedFormControl(profile.firstName),
    lastName: new UntypedFormControl(profile.lastName),
    phoneNumber: new UntypedFormControl(profile.phoneNumber),
    position: new UntypedFormControl(profile.position),
    avatar: new StorageFileForm(profile.avatar),
    email: new UntypedFormControl({ value: profile.email, disabled: true }),
    hideEmail: new UntypedFormControl(profile.hideEmail),
  };
}

export type ProfileControl = ReturnType<typeof createProfileControls>;

export class ProfileForm extends FormEntity<ProfileControl, User> {
  constructor(profile?: Profile) {
    super(createProfileControls(profile));
  }

  get avatar() { return this.get('avatar'); }
}
