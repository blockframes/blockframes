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
import { network, baseEnsDomain } from '@env';
import { getLabelByCode, Scope } from '@blockframes/movie/movie/static-model/staticModels';
import { getProvider, orgNameToEnsDomain } from '@blockframes/ethers/helpers';

export const urlValidators = [Validators.pattern('^(http|https)://[^ "]+$')];

export const yearValidators = Validators.pattern('^[1-2][0-9]{3}$');

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

/** Checks if the sum of all percentages controls of all FormGroups of FormArray does not exceed 100%  */
export function validPercentageList(control: FormArray): ValidationErrors {
  let sum = 0;
  // Counts the total percentages
  control.controls.forEach(formGroup => {
    sum += formGroup.get('percentage').value;
  });
  control.controls.forEach(formGroup => {
    if (sum > 100) {
      // If sum > 100: add the error percentageNotMatching
      const errors = formGroup.get('percentage').errors;
      formGroup.get('percentage').setErrors({ ...errors, percentageNotMatching: true });
    } else {
      // If the sum <= 100, we have to delete the percentageNotMatching error
      let errors = formGroup.get('percentage').errors;
      // If the control contains more than one error we delete the percentageNotMatching error
      if (errors && Object.keys(errors).length > 1) delete errors.percentageNotMatching;
      // If the control contains only the percentageNotMatching error, we set it to null
      else if (errors && Object.keys(errors).length === 1 && errors.percentageNotMatching)
        errors = null;
      formGroup.get('percentage').setErrors(errors);
    }
  });
  return;
}

/** Checks if the value of the control is between 0 and 100 */
export function validPercentage(control: FormControl): ValidationErrors {
  const value = Number(control.value);
  return value >= 0 && value <= 100 ? null : { invalidPercentage: true };
}

/** Check if the `name` field of an Organization create form already exists as an ENS domain */
export async function UniqueOrgName(control: AbstractControl): Promise<ValidationErrors | null> {
  // ! STRIP BLOCKCHAIN CODE
  if (false) {
    const orgENS = orgNameToEnsDomain(control.value, baseEnsDomain);
    const provider = getProvider(network);
    const orgEthAddress = await provider.resolveName(orgENS);
    return !orgEthAddress ? null : { notUnique: true };
  }
  // TODO check also unique on the firestore see issue#1142
  return null;
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
    const controlFrom = group.controls[from];
    const controlTo = group.controls[to];
    if (controlFrom instanceof Date && controlTo instanceof Date) {
      return controlFrom.value.getTime() > controlTo.value.getTime() &&
        group.touched &&
        group.dirty &&
        !group.pristine
        ? { invalidRange: true }
        : null;
    }
    return controlFrom.value > controlTo.value && group.touched && group.dirty && !group.pristine
      ? { invalidRange: true }
      : null;
  };
}

/**
 * @description This validator checks if the value in the form group
 * or form array is in the static model and then valid
 * @param scope defines where to look. For instance 'TERRITORIES'
 */
export function valueIsInModelValidator(scope: Scope): ValidatorFn {
  return (parent: FormGroup | FormArray): ValidationErrors => {
    if (parent.value.filter(val => getLabelByCode(scope, val)).length) {
      return null;
    } else {
      return { invalidValue: true };
    }
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
