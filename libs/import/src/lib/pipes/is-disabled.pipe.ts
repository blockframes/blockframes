import { NgModule, Pipe, PipeTransform } from '@angular/core';
import { ImportState } from '../utils';
import { errorCount } from './error-count.pipe';

@Pipe({ name: 'isDisabled' })
export class IsDisabledPipe implements PipeTransform {
  transform(element: ImportState, processing: number, imported = false) {
    return errorCount(element) > 0 || processing > 0 || element.importing || imported;
  }
}

@NgModule({
  exports: [IsDisabledPipe],
  declarations: [IsDisabledPipe],
})
export class IsDisabledPipeModule { }
