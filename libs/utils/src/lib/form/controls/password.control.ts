import { FormField } from '../forms'
import { AbstractControlOptions, Validators } from '@angular/forms';

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
