import { FormControl, Validators } from '@angular/forms';
import { FormEntity } from '@blockframes/utils';
import { User, createUser } from '@blockframes/auth/+state/auth.store';

function createUserAdminControls(entity: Partial<User>) {
  const user = createUser(entity);
  return {
    email: new FormControl(user.email, [Validators.required, Validators.email]),
    orgId: new FormControl(user.orgId, [Validators.required]),
    name: new FormControl(user.name, [Validators.required]),
    surname: new FormControl(user.surname, [Validators.required]),
    phonenumber: new FormControl(user.phoneNumber),
    position: new FormControl(user.position),
  };
}

type UserAdminControl = ReturnType<typeof createUserAdminControls>;

export class UserAdminForm extends FormEntity<UserAdminControl> {
  constructor(data?: User) {
    super(createUserAdminControls(data));
  }
}
