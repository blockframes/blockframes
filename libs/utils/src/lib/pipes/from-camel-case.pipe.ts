import { Pipe, PipeTransform, NgModule } from '@angular/core';

@Pipe({
  name: 'fromCamelCase'
})
export class FromCamelCasePipe implements PipeTransform {
  transform(value: string[]): string {
    return value.filter(v => !!v).map(string => string.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase())).join(', ');
  }
}

@NgModule({
  exports: [FromCamelCasePipe],
  declarations: [FromCamelCasePipe],
})
export class FromCamelCasePipeModule { }
