import { Pipe, PipeTransform } from '@angular/core';

/**
 * Cuts the text to provided length
 * and replace it with 3 dots
 */
@Pipe({
  name: 'maxLength'
})
export class MaxLength implements PipeTransform {
  transform(text: string, length: number) {
    return text.substr(0, length).concat('...');
  }
}
