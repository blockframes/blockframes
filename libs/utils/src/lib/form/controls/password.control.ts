import { FormField, FormEntity } from '../forms'
import { AbstractControlOptions, Validators } from '@angular/forms';
import { confirmPasswords } from '../validators/validators';

export const passwordValidators = [
  Validators.required,
  Validators.minLength(6),
  Validators.maxLength(24)
];

function defaultOptions(options: Partial<AbstractControlOptions> = {}): AbstractControlOptions {
  return {
    validators: passwordValidators,
    asyncValidators: [],
    updateOn: 'change',
    ...options,
  } as AbstractControlOptions
}

/* Checks if input is a valid password */
export class PasswordControl extends FormField<string> {
  constructor(value = '', validators?: Partial<AbstractControlOptions>) {
    super(value, defaultOptions(validators));
  }
}

export interface ConfirmPassword {
  password: string,
  confirm: string,
}

interface ConfirmPasswordControl {
  password: PasswordControl,
  confirm: PasswordControl,
}

export class ConfirmPasswordForm extends FormEntity<ConfirmPassword, ConfirmPasswordControl> {
  constructor(password?: string) {
    super({
      password: new PasswordControl(password),
      confirm: new PasswordControl(),
    }, { validators: confirmPasswords() });
  }
}
