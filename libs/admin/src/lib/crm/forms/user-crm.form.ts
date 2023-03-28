import { UntypedFormControl, Validators } from '@angular/forms';
import { createUser, User } from '@blockframes/model';
import { FormEntity } from '@blockframes/utils/form/forms/entity.form';

function createUserCrmControls(entity: Partial<User>) {
  const user = createUser(entity);
  return {
    email: new UntypedFormControl(user.email, [Validators.required, Validators.email]),
    orgId: new UntypedFormControl(user.orgId, [Validators.required]),
    firstName: new UntypedFormControl(user.firstName, [Validators.required]),
    lastName: new UntypedFormControl(user.lastName, [Validators.required]),
    phoneNumber: new UntypedFormControl(user.phoneNumber),
    position: new UntypedFormControl(user.position),
  };
}

type UserCrmControl = ReturnType<typeof createUserCrmControls>;

export class UserCrmForm extends FormEntity<UserCrmControl> {
  constructor(data?: User) {
    super(createUserCrmControls(data));
  }
}
