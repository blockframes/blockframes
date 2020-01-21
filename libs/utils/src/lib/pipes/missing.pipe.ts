import { Pipe, PipeTransform } from '@angular/core';
import { FormControl } from '@angular/forms';

@Pipe({
  name: 'missing'
})
export class MissingPipe implements PipeTransform {

  transform(control: FormControl) {
    return control.hasError('required') ? 'Mandatory' : control.value ? control.value : 'Missing';
  }
}
