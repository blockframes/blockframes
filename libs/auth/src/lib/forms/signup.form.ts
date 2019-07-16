import {
  EntityControl,
  PasswordControl,
  EmailControl,
  FormEntity
} from '@blockframes/utils';

interface SignUp {
  email: string
  password: string
}

function createSignup(params?: Partial<SignUp>): SignUp {
  return {
    email: '',
    password: '',
    ...(params || {})
  } as SignUp
}

function createSignupControls(entity: Partial<SignUp>): EntityControl<SignUp> {
  const singup = createSignup(entity);
  return {
    email: new EmailControl(singup.email),
    password: new PasswordControl(singup.password),
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
