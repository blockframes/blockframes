import { Pipe, PipeTransform } from '@angular/core';
import { FormControl } from '@angular/forms';
import { getLabelBySlug, Scope } from '../static-model/staticModels';

@Pipe({
  name: 'missingWithLabel'
})
export class MissingSlugPipe implements PipeTransform {

  transform(control: FormControl, property: Scope,) {
    return control.hasError('required') ? 'Mandatory' : control.value ? getLabelBySlug(property, control.value.trim().toLocaleLowerCase()) : 'Missing';
  }
}
