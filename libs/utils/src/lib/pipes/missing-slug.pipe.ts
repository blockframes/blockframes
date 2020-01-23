import { Pipe, PipeTransform } from '@angular/core';
import { FormControl } from '@angular/forms';
import { getLabelByCode, Scope } from '../static-model/staticModels';

@Pipe({
  name: 'missingWithSlug'
})
export class MissingSlugPipe implements PipeTransform {

  transform(control: FormControl, property: Scope,) {
    return control.hasError('required') ? 'Mandatory' : control.value ? getLabelByCode(property, control.value.trim().toLocaleLowerCase()) : 'Missing';
  }
}
