import { FormEntity } from '../forms'
import { AbstractControlOptions, Validators, FormControl } from '@angular/forms';
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
export class PasswordControl extends FormControl {
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
}

function createEditPasswordControls() {
  return {
    current: new PasswordControl(),
    next: new PasswordControl(),
  }
}

type EditPasswordControl = ReturnType<typeof createEditPasswordControls>;

export class EditPasswordForm extends FormEntity<EditPasswordControl> {
  constructor() {
    super(createEditPasswordControls());
  }
}

// Update Password
export interface UpdatePassword {
  current: string;
  next: string;
  confirm: string;
}

function createUpdatePasswordControls(current: PasswordControl) {
  return {
    current,
    next: new PasswordControl(),
    confirm: new PasswordControl()
  }
}

export type UpdatePasswordControl = ReturnType<typeof createUpdatePasswordControls>;

export class UpdatePasswordForm extends FormEntity<UpdatePasswordControl> {
  constructor(currentControl: PasswordControl) {
    super(createUpdatePasswordControls(currentControl), { validators: [
      confirmPasswords('next', 'confirm'),
      differentPassword()
    ]})
  }
}