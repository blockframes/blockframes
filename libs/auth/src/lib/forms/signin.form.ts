import {
  EntityControl,
  FormEntity,
  PasswordControl
} from '@blockframes/utils';
import { FormControl, Validators } from '@angular/forms';

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
    email: new FormControl(signin.email, [Validators.required, Validators.email]),
    password: new PasswordControl(signin.password),
  }
}

type SigninControl = ReturnType<typeof createSigninControls>;

export class SigninForm extends FormEntity<SignIn, SigninControl> {
  constructor(data?: SignIn) {
    super(createSigninControls(data))
  }
}
