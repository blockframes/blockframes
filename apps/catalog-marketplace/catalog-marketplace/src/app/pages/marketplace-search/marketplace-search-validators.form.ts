import { AbstractControl } from '@angular/forms';
import { movieLanguages } from './marketplace-search.form';

export function languageValidator(control: AbstractControl): { [key: string]: boolean } | null {
  return !movieLanguages.includes(control.value) ? { languageNotSupported: true } : null;
}
