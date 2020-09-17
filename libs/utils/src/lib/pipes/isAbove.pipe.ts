import { Pipe, PipeTransform, NgModule } from '@angular/core';

@Pipe({
  name: 'isAbove'
})
export class IsAbovePipe implements PipeTransform {
  transform(count: number, min: number): boolean {
    if (min === 0 || !min) min = 0;
    return count > min;
  }
}

@NgModule({
  exports: [IsAbovePipe],
  declarations: [IsAbovePipe],
})
export class IsAboveModule { }
