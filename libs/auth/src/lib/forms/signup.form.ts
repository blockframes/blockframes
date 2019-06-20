import {
  EntityControl,
  EntityRulesForm,
  PasswordControl,
  EmailControl,
  checkPasswords
} from '@blockframes/utils';
import { ValidatorFn } from '@angular/forms';

interface SignUp {
  email: string
  password: string 
  confirm: string
}

function createSignup(params?: Partial<SignUp>): SignUp {
  return {
    email: '',
    password: '',
    confirm: '',
    ...(params || {})
  } as SignUp
}

function createSignupControls(entity: Partial<SignUp>): EntityControl<SignUp> {
  const singup = createSignup(entity);
  return {
    email: new EmailControl(singup.email),
    password: new PasswordControl(singup.password),
    confirm: new PasswordControl(singup.confirm),
  }
}

function createSignupValidators(validators?: any[]): ValidatorFn[]{
  if(validators && validators.length) {
    return validators;
  } else {
    return [checkPasswords()];
  }
}

export class SignupForm extends EntityRulesForm<SignUp> {
  constructor(data?: SignUp, validators?: any[]) {
    super(
      createSignupControls(data),
      createSignupValidators(validators),
    )
  }
}