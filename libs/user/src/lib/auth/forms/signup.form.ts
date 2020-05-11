import { FormControl, Validators } from '@angular/forms';
import { EntityControl, FormEntity } from '@blockframes/utils/form/forms/entity.form';
import { PasswordControl } from '@blockframes/utils/form/controls/password.control';

interface SignUp {
  email: string
  password: string,
  firstName: string,
  lastName: string,
  termsOfUseChecked: boolean
}

function createSignup(params?: Partial<SignUp>): SignUp {
  return {
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    termsOfUseChecked: false,
    ...(params || {})
  } as SignUp
}

function createSignupControls(entity: Partial<SignUp>): EntityControl<SignUp> {
  const signup = createSignup(entity);
  return {
    email: new FormControl(signup.email, [Validators.required, Validators.email]),
    password: new PasswordControl(signup.password),
    firstName: new FormControl(signup.firstName),
    lastName: new FormControl(signup.lastName),
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
