import {
  EntityControl,
  EntityRulesForm,
  PasswordControl,
  EmailControl
} from '@blockframes/utils';

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

export class SigninForm extends EntityRulesForm<SignIn> {
  constructor(data?: SignIn) {
    super(createSigninControls(data))
  }
}