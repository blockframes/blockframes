import { NgModule } from '@angular/core';
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'fileName'
})
export class FileNamePipe implements PipeTransform {
  transform(file: string) {
    if (typeof file !== 'string') {
      console.warn('UNEXPECTED FILE', file);
      return '';
    }
    const arrayedRef = file.split('/');
    return arrayedRef.pop();
  }
}

@NgModule({
  exports: [FileNamePipe],
  declarations: [FileNamePipe],
})
export class FileNameModule { }
