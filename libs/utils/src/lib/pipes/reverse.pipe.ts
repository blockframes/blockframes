import { Pipe, PipeTransform } from '@angular/core';

/**
 * When called, reverse the items in the array.
 * Can be used after " array$ | async" too.
 */
@Pipe({
  name: 'reverse'
})
export class ReversePipe implements PipeTransform {

  transform(value) {
      if (!value) return;

      return value.reverse();
    }
}
