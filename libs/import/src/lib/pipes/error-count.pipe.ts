import { NgModule, Pipe, PipeTransform } from '@angular/core';
import { ImportState, SpreadsheetImportError } from '../utils';

export function errorCount(data: ImportState, type: string = 'error') {
  return data.errors.filter((error: SpreadsheetImportError) => error.type === type).length;
}

@Pipe({ name: 'errorCount' })
export class ErrorCountPipe implements PipeTransform {
  transform(element: ImportState, type: string = 'error') {
    return errorCount(element, type);
  }
}

@NgModule({
  exports: [ErrorCountPipe],
  declarations: [ErrorCountPipe],
})
export class ErrorCountPipeModule { }