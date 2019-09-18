import { AbstractControl } from '@angular/forms';
import { LANGUAGES_LABEL } from '@blockframes/movie/movie/static-model/types';

export function languageValidator(control: AbstractControl): { [key: string]: boolean } | null {
  return !LANGUAGES_LABEL.includes(control.value) ? { languageNotSupported: true } : null;
}
