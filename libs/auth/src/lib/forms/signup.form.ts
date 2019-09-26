import {
  EntityControl,
  PasswordControl,
  EmailControl,
  FormEntity
} from '@blockframes/utils/form';
import { FormControl, Validators } from '@angular/forms';

interface SignUp {
  email: string
  password: string,
  name: string,
  surname: string
}

function createSignup(params?: Partial<SignUp>): SignUp {
  return {
    email: '',
    password: '',
    name: '',
    surname: '',
    ...(params || {})
  } as SignUp
}

function createSignupControls(entity: Partial<SignUp>): EntityControl<SignUp> {
  const signup = createSignup(entity);
  return {
    email: new EmailControl(signup.email),
    password: new PasswordControl(signup.password),
    name: new FormControl(signup.name),
    surname: new FormControl(signup.surname)
  }
}

type SignupControl = ReturnType<typeof createSignupControls>;

export class SignupForm extends FormEntity<SignUp, SignupControl> {
  constructor(data?: SignUp) {
    super(
      createSignupControls(data),
    )
  }
}
