import { Pipe, PipeTransform, NgModule } from '@angular/core';

@Pipe({
  name: 'parseCamelCase'
})
export class ParseCamelCasePipe implements PipeTransform {
  transform(value: string): string {
    return value.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase())

  }
}

@NgModule({
  exports: [ParseCamelCasePipe],
  declarations: [ParseCamelCasePipe],
})
export class ParseCamelCasePipeModule { }
