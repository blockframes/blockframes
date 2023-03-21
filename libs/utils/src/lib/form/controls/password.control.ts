import { FormEntity } from '../forms'
import { AbstractControlOptions, Validators, UntypedFormControl } from '@angular/forms';
import { confirmPasswords, differentPassword } from '../validators/validators';

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
export class PasswordControl extends UntypedFormControl {
  constructor(value = '', validators?: Partial<AbstractControlOptions>) {
    super(value, defaultOptions(validators));
  }
}

// Confirm Password
export interface ConfirmPassword {
  password: string,
  confirm: string,
}

function createConfirmPasswordControls(password: string) {
  return {
    password: new PasswordControl(password),
    confirm: new PasswordControl(),
  }
}

type ConfirmPasswordControl = ReturnType<typeof createConfirmPasswordControls>;

export class ConfirmPasswordForm extends FormEntity<ConfirmPasswordControl> {
  constructor(password?: string) {
    super(createConfirmPasswordControls(password), { validators: confirmPasswords() });
  }
}

// Edit Password
export interface EditPassword {
  current: string,
  next: string,
  confirm: string
}

function createEditPasswordControls() {
  return {
    current: new PasswordControl(),
    next: new PasswordControl(),
    confirm: new PasswordControl()
  }
}

type EditPasswordControl = ReturnType<typeof createEditPasswordControls>;

export class EditPasswordForm extends FormEntity<EditPasswordControl> {
  constructor() {
    super(createEditPasswordControls(), { validators: [
      confirmPasswords('next', 'confirm'),
      differentPassword('current', 'next')
    ]});
  }
}