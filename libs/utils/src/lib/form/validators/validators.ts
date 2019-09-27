import {
  AbstractControl,
  FormControl,
  FormGroup,
  ValidationErrors,
  ValidatorFn,
  Validators,
  FormArray
} from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';
import { LANGUAGES_SLUG } from '@blockframes/movie/movie/static-model/types';
import { InfuraProvider } from '@ethersproject/providers';
import { isValidMnemonic } from '@ethersproject/hdnode';
import { orgNameToEnsDomain } from '../../helpers';
import { network } from '@env';

export const emailValidators = [Validators.required, Validators.email];

export const stringValidators = [];

export const urlValidators = [Validators.pattern('^(http|https)://[^ "]+$')];

export const yearValidators = Validators.pattern('^[1-2][0-9]{3}$');

export const ethereumPublicAddressValidators = [Validators.pattern('^0x[0-9a-fA-F]{40}$')];

export const ethereumPrivateAddressValidators = [Validators.pattern('^[0-9a-fA-F]{64}$')];

/** Require password and password confirm inputs to be the same */
export function confirmPasswords(
  password: string = 'password',
  confirm: string = 'confirm'
): ValidatorFn {
  return (group: FormGroup): { [key: string]: boolean } | null => {
    return group.controls[password].value === group.controls[confirm].value
      ? null
      : { passwordsNotMatching: true };
  };
}

/** Require **either** mnemonic **or** private key **but not both** */
export function requireMnemonicXorPrivateKey(control: FormControl) {
  const { mnemonic, privateKey } = control.value;
  return !!mnemonic !== !!privateKey ? null : { bothEmpty: true }; // logical XOR
}

/** Checks if the inputted mnemonic is a valid mnemonic */
export function validMnemonic(control: AbstractControl): ValidationErrors | null {
  // Every Mnemonic has 24 words, if not it is not a Mnemonic
  const size = control.value.split(' ').length;
  if (size !== 24) {
    return { mnemonic: true };
  }
  // Use ethers.js build in function to check for a correct Mnemonic
  const isValid = isValidMnemonic(control.value);
  return isValid ? null : { mnemonic: true };
}

/** Checks if the sum of all percentages of FormArray does not exceed 100%  */
export function validPercentageList(control: FormArray) {
    let sum = 0;
    control.controls.forEach(formGroup => {
      sum += formGroup.get('percentage').value;
    });
    control.controls.forEach(formGroup => {
      if (sum > 100) {
        if (formGroup.get('percentage').value === null) formGroup.get('percentage').setErrors({ required: true });
        else if (formGroup.get('percentage').value > 100) formGroup.get('percentage').setErrors({ invalidPercentage: true });
        else formGroup.get('percentage').setErrors({ percentageNotMatching: true });
      } else {
        if (formGroup.get('percentage').value === null) formGroup.get('percentage').setErrors({ required: true });
        else if (formGroup.get('percentage').value < 0) formGroup.get('percentage').setErrors({ invalidPercentage: true });
        else formGroup.get('percentage').setErrors(null);
      }
    });
    return null;
}

/** Check if the `name` field of an Organization create form already exists as an ENS domain */
export async function UniqueOrgName(control: AbstractControl): Promise<ValidationErrors | null> {
  const orgENS = orgNameToEnsDomain(control.value);
  const provider = new InfuraProvider(network);
  const orgEthAddress = await provider.resolveName(orgENS);
  return !orgEthAddress ? null : { notUnique: true };
}

/**
 * Checks if the language exists
 */
export function languageValidator(control: AbstractControl): { [key: string]: boolean } | null {
  return !LANGUAGES_SLUG.includes(control.value.trim().toLowerCase())
    ? { languageNotSupported: true }
    : null;
}
/**
 * @description Form group validator that checks if the two children controls have a valid range
 * @param from range from
 * @param to range to
 */
export function numberRangeValidator(from: string, to: string): ValidatorFn {
  return (group: FormGroup): ValidationErrors => {
    const control1 = group.controls[`${from}`];
    const control2 = group.controls[`${to}`];
    if (control1 instanceof Date) {
      return control1.value.getTime() > control2.value.getTime() &&
        group.touched &&
        group.dirty &&
        !group.pristine
        ? { invalidRange: true }
        : null;
    }
    return control1.value > control2.value && group.touched && group.dirty && !group.pristine
      ? { invalidRange: true }
      : null;
  };
}

/**
 * @description Error state matcher which is just like in the docs from angular material.
 * Basic usage for invalid, dirty and touched checks.
 */
export class ControlErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null): boolean {
    return !!(control && control.invalid && control.touched);
  }
}
