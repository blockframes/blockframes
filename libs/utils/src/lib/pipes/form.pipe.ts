import { NgModule, Pipe, PipeTransform } from '@angular/core';
import { AbstractControl } from '@angular/forms';
import { startWith } from 'rxjs/operators';

@Pipe({ name: 'valueChanges' })
export class ValueChangesPipe implements PipeTransform {
  transform(control: AbstractControl, path: string = '') {
    const form = path ? control.get(path) : control;
    return form.valueChanges.pipe(
      startWith(form.value)
    )
  }
}

@NgModule({
  declarations: [ValueChangesPipe],
  exports: [ValueChangesPipe]
})
export class FormPipeModule {}