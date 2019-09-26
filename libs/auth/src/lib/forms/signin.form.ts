import {
  EntityControl,
  FormEntity,
  PasswordControl,
  EmailControl
} from '@blockframes/utils/form';

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
    email: new EmailControl(signin.email),
    password: new PasswordControl(signin.password),
  }
}

type SigninControl = ReturnType<typeof createSigninControls>;

export class SigninForm extends FormEntity<SignIn, SigninControl> {
  constructor(data?: SignIn) {
    super(createSigninControls(data))
  }
}
