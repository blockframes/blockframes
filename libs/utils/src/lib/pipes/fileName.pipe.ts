import { NgModule } from '@angular/core';
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'fileName'
})
export class FileNamePipe implements PipeTransform {
  transform(ref: string) {
    const arrayedRef = ref.split('/')
    return arrayedRef.pop();
  }
}

@NgModule({
  exports: [FileNamePipe],
  declarations: [FileNamePipe],
})
export class FileNameModule { }
