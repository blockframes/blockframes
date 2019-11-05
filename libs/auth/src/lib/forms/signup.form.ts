import {
  EntityControl,
  PasswordControl,
  FormEntity
} from '@blockframes/utils';
import { FormControl, Validators } from '@angular/forms';

interface SignUp {
  email: string
  password: string,
  name: string,
  surname: string,
  termsOfUseChecked: boolean
}

function createSignup(params?: Partial<SignUp>): SignUp {
  return {
    email: '',
    password: '',
    name: '',
    surname: '',
    termsOfUseChecked: false,
    ...(params || {})
  } as SignUp
}

function createSignupControls(entity: Partial<SignUp>): EntityControl<SignUp> {
  const signup = createSignup(entity);
  return {
    email: new FormControl(signup.email, [Validators.required, Validators.email]),
    password: new PasswordControl(signup.password),
    name: new FormControl(signup.name),
    surname: new FormControl(signup.surname),
    termsOfUseChecked: new FormControl(signup.termsOfUseChecked)
  }
}

type SignupControl = ReturnType<typeof createSignupControls>;

export class SignupForm extends FormEntity<SignupControl> {
  constructor(data?: SignUp) {
    super(
      createSignupControls(data),
    )
  }
}
