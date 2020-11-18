import { Pipe, PipeTransform, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * When called, reverse the items in the array.
 * Can be used after " array$ | async" too.
 */
@Pipe({
  name: 'reverse'
})
export class ReversePipe implements PipeTransform {

  transform(value, reverse = true) {
    if (!value) return;

    return reverse ? value.reverse() : value;
  }
}

@NgModule({
  declarations: [ReversePipe],
  imports: [CommonModule],
  exports: [ReversePipe]
})
export class ReverseModule { }
