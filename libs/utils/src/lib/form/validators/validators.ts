import { Validators, FormGroup, ValidatorFn, FormControl } from '@angular/forms';
import { rules } from './rules';

export const emailValidators = [
  Validators.required,
  Validators.email
]

export const stringValidators = [

];

export const yearValidators = [
  Validators.pattern("^[1-2][0-9]{3}$"),
];

export const ethereumPublicAddressValidators = [
  Validators.pattern('^0x[0-9a-fA-F]{40}$'),
];

export const ethereumPrivateAddressValidators = [
  Validators.pattern('^[0-9a-fA-F]{64}$'),
];

export const ethereumMnemonicValidators = [
  //@todo
];

/** Require password and password confirm inputs to be the same */
export function checkPasswords(password: string = 'password', confirm: string = 'confirm'): ValidatorFn {
  return (group: FormGroup): { [key: string]: boolean } | null => {
    return group.controls[password].value === group.controls[confirm].value ? null : { passwordsNotMatching: true }
  };
};

/** Require **either** mnemonic **or** private key **but not both** */
export function requireMnemonicXorPrivateKey(control: FormControl) {
  const { mnemonic, privateKey } = control.value;
  return (!!mnemonic !== !!privateKey) ? null : { bothEmpty: true }; // logical XOR
}
