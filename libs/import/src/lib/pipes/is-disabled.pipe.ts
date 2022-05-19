import { NgModule, Pipe, PipeTransform } from '@angular/core';
import { ImportState } from '../utils';
import { errorCount } from './error-count.pipe';

//@continue from here. The create button is disabled only if we set pure to false in the Pipe annotation.
@Pipe({ name: 'isDisabled', pure:false })
export class IsDisabledPipe implements PipeTransform {
  transform(element: ImportState, processing: number) {
    console.log({element})
    return errorCount(element) > 0 || processing > 0 || element.importing || element.imported;
  }
}

@NgModule({
  exports: [IsDisabledPipe],
  declarations: [IsDisabledPipe],
})
export class IsDisabledPipeModule { }
