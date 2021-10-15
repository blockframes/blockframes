import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { Pipe, PipeTransform } from '@angular/core';

/**
 * Trims a string without cropping the last word if keepLastWordComplete is set to true
 */
function trimString(string: string, length: number, keepLastWordComplete: boolean) {
  if (!string?.length || string.length <= length) return string;

  let trimmedString = string.substr(0, length);
  if (keepLastWordComplete) {
    const lastWordIndex = Math.min(trimmedString.length, trimmedString.lastIndexOf(' '));
    trimmedString = trimmedString.substr(0, lastWordIndex);
  }
  return `${trimmedString}...`;
}

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
