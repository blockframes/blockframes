import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { Pipe, PipeTransform } from '@angular/core';

/**
 * Cuts the text to provided length
 * and replace it with 3 dots
 */
@Pipe({ name: 'maxLength' })
export class MaxLength implements PipeTransform {
  transform(text: string, length: number) {
    if(text?.length && text.length > length) {
      return text.substr(0, length).concat('...');
    }
    return text;
  }
}

@NgModule({
  declarations: [MaxLength],
  imports: [CommonModule],
  exports: [MaxLength]
})
export class MaxLengthModule { }
