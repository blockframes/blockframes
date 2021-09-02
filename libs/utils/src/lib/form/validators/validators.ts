import {
  AbstractControl,
  FormControl,
  FormGroup,
  ValidationErrors,
  ValidatorFn,
  Validators,
  FormArray
} from '@angular/forms';
import { languages, isInKeys, Scope, staticModel } from '@blockframes/utils/static-model';

export const urlValidators = Validators.pattern(/^(http(s)?:\/\/www\.|http(s)?:\/\/)[a-z0-9]+([-.]{1}[a-z0-9]+)*\.[a-z]{2,5}(:[0-9]{1,5})?(\/.*)?$/);

export function yearValidators(): ValidatorFn {
  return (control: AbstractControl): { [key: string]: boolean } | null => {
    if (control.dirty) {
      if (typeof control.value === 'string') {
        return /^[1-2][0-9]{3}$/.test(control.value) ? null : { invalidYear: true };
      } else if (typeof control.value === 'number') {
        const max = new Date().getFullYear() + 20;
        return control.value > 1900 && control.value < max ? null : { invalidYear: true };
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
 * @description Check in a number-range that from is below to, and to is above from
 */
export function validRange(): ValidatorFn {
  return (parent: FormGroup): ValidationErrors => {
    return parent.value.from > parent.value.to ? { invalidOrder: true } : null;
  };
}

/**
 * @description This validator checks if the value in the form group
 * or form array is in the static constant and then valid
 * @param scope defines where to look. For instance 'TERRITORIES'
 */
export function valueIsInConstantValidator(scope: Scope): ValidatorFn {
  return (parent: FormGroup | FormArray): ValidationErrors => {
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
  return (control: FormControl): ValidationErrors => {
    if (!control.value) {
      return null;
    } else {
      return isInKeys(scope, control.value) ? null : { invalidValue: true }
    };
  };
}

/**
 * @description Check if all values are keys of the scope provided, inside the static constant
 * @param scope Scope inside the static model
 */
export function isKeyArrayValidator(scope: Scope): ValidatorFn {
  return (control: FormControl): ValidationErrors => {
    return control.value?.every(value => isInKeys(scope, value)) ? null : { invalidValue: true }
  };
}

/**
 * Check if from date is after to date
 * @param fromKey name of key of from date
 * @param toKey name of key of to date
 * @returns
 */
export function compareDates(fromKey: string, toKey: string, keyOnControl?: string): ValidatorFn {
  return (form: FormControl): ValidationErrors => {
    const eventForm = form?.parent as FormGroup;
    if (eventForm) {
      const from = keyOnControl === fromKey ? form.value : eventForm.value[fromKey];
      const to = keyOnControl === toKey ? form.value : eventForm.value[toKey]

      let fromErrors = eventForm.controls['from'].errors;
      let toErrors = eventForm.controls['to'].errors;

      if (keyOnControl === fromKey && from && to && to < from) {
        if (!('startOverEnd' in (toErrors ?? { }))) {
          eventForm.controls['to'].setErrors({ ...(toErrors??{}), startOverEnd: true })
        }
      } else if (keyOnControl === fromKey && from && to && to > from) {
        if (toErrors && 'startOverEnd' in toErrors) {
          delete toErrors.startOverEnd;
          if (Object.keys(toErrors).length < 1) { toErrors = null }
          eventForm.controls['to'].setErrors(toErrors)
        }
      }

      if (keyOnControl === toKey && from && to && from > to) {
        if (!('startOverEnd' in (fromErrors ?? { }))) {
          eventForm.controls['from'].setErrors({...(fromErrors??{}), startOverEnd: true })
        }
      } else if (keyOnControl === toKey && from && to && from < to) {
        if (fromErrors && 'startOverEnd' in fromErrors) {
          delete fromErrors.startOverEnd;
          if (Object.keys(fromErrors).length < 1) { fromErrors = null }
          eventForm.controls['from'].setErrors(fromErrors)
        }
      }

      if (from && to && from > to) {
        return { startOverEnd: true }
      }

    }
    return null;
  }
}

/**
 * Check if date is not before today
 */
export function isDateInFuture(form: FormControl) {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return form.value < now ? { inPast: true } : null;
}
