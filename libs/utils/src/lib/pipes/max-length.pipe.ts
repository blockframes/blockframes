import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { Pipe, PipeTransform } from '@angular/core';
import { trimString } from '@blockframes/model';

/**
 * Cuts the text to provided length
 * and replace it with 3 dots
 */
@Pipe({ name: 'maxLength' })
export class MaxLengthPipe implements PipeTransform {
  transform(text: string, length: number, keepLastWordComplete = false) {
    return trimString(text, length, keepLastWordComplete);
  }
}

@NgModule({
  declarations: [MaxLengthPipe],
  imports: [CommonModule],
  exports: [MaxLengthPipe]
})
export class MaxLengthModule { }
