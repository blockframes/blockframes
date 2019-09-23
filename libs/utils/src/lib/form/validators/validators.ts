import { ethers } from 'ethers';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  ValidationErrors,
  ValidatorFn,
  Validators
} from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';
import { LANGUAGES_SLUG } from '@blockframes/movie/movie/static-model/types';
import { getDefaultProvider } from 'ethers';
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

/** Check if the `name` field of an Organization create form already exists as an ENS domain */
export async function UniqueOrgName(control: AbstractControl): Promise<ValidationErrors | null> {
  const orgENS = orgNameToEnsDomain(control.value);
  const orgAddress = await getDefaultProvider(network).resolveName(orgENS);
  return !orgAddress ? null : { notUnique: true };
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
 * @description Error state matcher for only one control
 */
export class ControlErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null): boolean {
    return !!(control && control.invalid && control.touched);
  }
}
