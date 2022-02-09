import { FormControl, Validators } from '@angular/forms';
import { createUser } from '@blockframes/auth/+state/auth.service';
import { User } from '@blockframes/user/+state/user.model';
import { FormEntity } from '@blockframes/utils/form/forms/entity.form';

function createUserCrmControls(entity: Partial<User>) {
  const user = createUser(entity);
  return {
    email: new FormControl(user.email, [Validators.required, Validators.email]),
    orgId: new FormControl(user.orgId, [Validators.required]),
    firstName: new FormControl(user.firstName, [Validators.required]),
    lastName: new FormControl(user.lastName, [Validators.required]),
    phoneNumber: new FormControl(user.phoneNumber),
    position: new FormControl(user.position),
  };
}

type UserCrmControl = ReturnType<typeof createUserCrmControls>;

export class UserCrmForm extends FormEntity<UserCrmControl> {
  constructor(data?: User) {
    super(createUserCrmControls(data));
  }
}
