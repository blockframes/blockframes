import { FormControl, Validators } from '@angular/forms';
import { FormEntity } from '@blockframes/utils/form/forms/entity.form';
import { User, createUser } from '@blockframes/auth/+state/auth.store';

function createUserAdminControls(entity: Partial<User>) {
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

type UserAdminControl = ReturnType<typeof createUserAdminControls>;

export class UserAdminForm extends FormEntity<UserAdminControl> {
  constructor(data?: User) {
    super(createUserAdminControls(data));
  }
}
