import {
  AbstractControl,
  UntypedFormControl,
  UntypedFormGroup,
  ValidationErrors,
  ValidatorFn,
  Validators,
  UntypedFormArray
} from '@angular/forms';
import { languages, isInKeys, Scope, staticModel } from '@blockframes/model';

export const urlValidators = Validators.pattern(/^(http(s)?:\/\/www\.|http(s)?:\/\/)[a-z0-9]+([-.]{1}[a-z0-9]+)*\.[a-z]{2,5}(:[0-9]{1,5})?(\/.*)?$/);

export const maxYear = new Date().getFullYear() + 20;

export function yearValidators(): ValidatorFn {
  return (control: AbstractControl): { [key: string]: boolean } | null => {
    if (control.dirty) {
      if (typeof control.value === 'string') {
        return /^[1-2][0-9]{3}$/.test(control.value) ? null : { invalidYear: true };
      } else if (typeof control.value === 'number') {
        return control.value > 1900 && control.value < maxYear ? null : { invalidYear: true };
      } else {
        return null;
      }
    } else {
      return null;
    }
  }
}

/** Require password and password confirm inputs to be the same */
export function confirmPasswords(
  password = 'password',
  confirm = 'confirm'
): ValidatorFn {
  return (group: UntypedFormGroup): { [key: string]: boolean } | null => {
    return group.controls[password].value === group.controls[confirm].value
      ? null
      : { passwordsNotMatching: true };
  };
}

/** Require current and new password to be different */
export function differentPassword(current = 'current', next = 'next'): ValidatorFn {
  return (group: UntypedFormGroup): { [key: string]: boolean } | null => {
    const currentControl = group.controls[current];
    const nextControl = group.controls[next];
    if (currentControl.value !== nextControl.value) return null;
    if (currentControl.disabled && nextControl.disabled) return null;
    return { currentPasswordMatch: true };
  }
}

/** Checks if the sum of all percentages controls of all FormGroups of FormArray does not exceed 100%  */
export function validPercentageList(control: UntypedFormArray): ValidationErrors {
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
export function validPercentage(control: UntypedFormControl): ValidationErrors {
  const value = Number(control.value);
  return value >= 0 && value <= 100 ? null : { invalidPercentage: true };
}

/**
 * Checks if the language exists
 */
export function languageValidator(control: AbstractControl): { [key: string]: boolean } | null {
  return !Object.keys(languages).includes(control.value.trim().toLowerCase())
    ? { languageNotSupported: true }
    : null;
}
/**
 * @description Form group validator that checks if the two children controls have a valid range
 * @param from range from
 * @param to range to
 */
export function numberRangeValidator(from: string, to: string): ValidatorFn {
  return (group: UntypedFormGroup): ValidationErrors => {
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
 * @description Check in a number-range that from is below to, and to is above from
 */
export function validRange(): ValidatorFn {
  return (parent: UntypedFormGroup): ValidationErrors => {
    return parent.value.from > parent.value.to ? { invalidOrder: true } : null;
  };
}

/**
 * @description This validator checks if the value in the form group
 * or form array is in the static constant and then valid
 * @param scope defines where to look. For instance 'TERRITORIES'
 */
export function valueIsInConstantValidator(scope: Scope): ValidatorFn {
  return (parent: UntypedFormGroup | UntypedFormArray): ValidationErrors => {
    if (parent.value.filter(val => staticModel[scope][val]).length) {
      return null;
    } else {
      return { invalidValue: true };
    }
  };
}

/**
 * @description Check if value is a key of the scope provided, inside the static constant
 * @param scope Scope inside the static constant
 */
export function isKeyValidator(scope: Scope): ValidatorFn {
  return (control: UntypedFormControl): ValidationErrors => {
    if (!control.value) {
      return null;
    } else {
      return isInKeys(scope, control.value) ? null : { invalidValue: true }
    }
  };
}

/**
 * @description Check if all values are keys of the scope provided, inside the static constant
 * @param scope Scope inside the static model
 */
export function isKeyArrayValidator(scope: Scope): ValidatorFn {
  return (control: UntypedFormControl): ValidationErrors => {
    return control.value?.every(value => isInKeys(scope, value)) ? null : { invalidValue: true }
  };
}

/**
 * Check if from date is after to date
 * @param fromKey name of key of from date
 * @param toKey name of key of to date
 * @returns
 */
export function compareDates(fromKey: string, toKey: string, keyOnControl?: string, errorName = 'startOverEnd'): ValidatorFn {
  return (control: UntypedFormControl): ValidationErrors => {
    const parentForm = control?.parent as UntypedFormGroup;

    if (!parentForm) return null;

    if (!parentForm.contains(fromKey) || !parentForm.contains(toKey)) {
      const keys = Object.keys(parentForm.controls).join(', ');
      throw new Error(`Could not find keys ${fromKey} or ${toKey} in the form with keys ${keys}`);
    }

    const from = parentForm.get(fromKey).value;
    const to = parentForm.get(toKey).value;

    if (!from || !to) return null;

    if (keyOnControl) {
      const otherKey = keyOnControl === fromKey ? toKey : fromKey;
      const otherControl = parentForm.get(otherKey);
      const otherErrors = otherControl.errors ?? {};

      /**
       * Given keyOnControl, checks the value of both fields
       * 'from' and 'to' to ensure that shown errors are logical
       * with respect to the values of both fields.
       */
      if (to < from) {
        otherControl.setErrors({ ...otherErrors, [errorName]: true });
      } else {
        if (errorName in otherErrors) {
          delete otherErrors[errorName];
          !Object.keys(otherErrors).length
            ? otherControl.setErrors(null)
            : otherControl.setErrors(otherErrors);
        }
      }
    }
    if (to < from) { return { [errorName]: true }; }
    else { return null; }
  }
}

/**
 * Check if date is not before today
 */
export function isDateInFuture(form: UntypedFormControl) {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return form.value < now ? { inPast: true } : null;
}

/**
 * Check if date is not before another date
 */
export function isDateAfter(date: Date): ValidatorFn {
  return (control: UntypedFormControl): ValidationErrors => {
    date.setHours(0, 0, 0, 0);
    return control.value < date ? { isBefore: true } : null;
  };
}
