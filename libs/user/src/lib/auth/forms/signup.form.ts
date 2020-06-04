import { FormControl, Validators } from '@angular/forms';
import { EntityControl, FormEntity } from '@blockframes/utils/form/forms/entity.form';
import { PasswordControl } from '@blockframes/utils/form/controls/password.control';

interface SignUp {
  email: string
  password: string,
  firstName: string,
  lastName: string,
  termsOfUseChecked: boolean
  privacyPolicyChecked: boolean
}

function createSignup(params?: Partial<SignUp>): SignUp {
  return {
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    termsOfUseChecked: false,
    privacyPolicyChecked: false,
    ...(params || {})
  } as SignUp
}

function createSignupControls(entity: Partial<SignUp>): EntityControl<SignUp> {
  const signup = createSignup(entity);
  return {
    email: new FormControl(signup.email, [Validators.required, Validators.email]),
    password: new PasswordControl(signup.password),
    firstName: new FormControl(signup.firstName, Validators.required),
    lastName: new FormControl(signup.lastName, Validators.required),
    termsOfUseChecked: new FormControl(signup.termsOfUseChecked, Validators.requiredTrue),
    privacyPolicyChecked: new FormControl(signup.privacyPolicyChecked, Validators.requiredTrue),
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
