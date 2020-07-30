import { NgModule } from '@angular/core';
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'fileName'
})
export class FileNamePipe implements PipeTransform {
  transform(file: string) {
    if (!file || typeof file !== 'string')  return '';
    const arrayedRef = file.split('/');
    return arrayedRef.pop();
  }
}

@NgModule({
  exports: [FileNamePipe],
  declarations: [FileNamePipe],
})
export class FileNameModule { }
