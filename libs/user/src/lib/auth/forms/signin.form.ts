import { UntypedFormControl, Validators } from '@angular/forms';
import { EntityControl, FormEntity } from '@blockframes/utils/form/forms/entity.form';
import { PasswordControl } from '@blockframes/utils/form/controls/password.control';

interface SignIn {
  email: string
  password: string
}

function createSignin(params?: Partial<SignIn>): SignIn {
  return {
    email: '',
    password: '',
    ...(params || {})
  } as SignIn
}

function createSigninControls(entity: Partial<SignIn>): EntityControl<SignIn> {
  const signin = createSignin(entity);
  return {
    email: new UntypedFormControl(signin.email, [Validators.required, Validators.email]),
    password: new PasswordControl(signin.password),
  }
}

type SigninControl = ReturnType<typeof createSigninControls>;

export class SigninForm extends FormEntity<SigninControl> {
  constructor(data?: SignIn) {
    super(createSigninControls(data))
  }
}
