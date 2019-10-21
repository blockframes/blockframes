import { AbstractControl, ValidationErrors } from "@angular/forms";
import { isValidMnemonic } from "@ethersproject/hdnode";

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
