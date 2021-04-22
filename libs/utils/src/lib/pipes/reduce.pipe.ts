import { NgModule } from '@angular/core';
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'reduce',
  pure: false
})
export class ReducePipe implements PipeTransform {
  transform(numbers: number[]): number {
    return numbers.reduce((arr, curr) => (arr + curr), 0)
  }
}

@NgModule({
  exports: [ReducePipe],
  declarations: [ReducePipe],
})
export class ReducePipeModule { }
