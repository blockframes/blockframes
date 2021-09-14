import { Pipe, PipeTransform, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * Trims a string without cropping the last word
 * @param string 
 * @param length 
 * @param addEllipsis 
 * @returns 
 */
function trimString(string: string, length: number, addEllipsis = true) {
  if (string.length <= length) return string;
  const trimmedString = string.substr(0, length);
  return `${trimmedString.substr(0, Math.min(trimmedString.length, trimmedString.lastIndexOf(' ')))}${addEllipsis ? '...' : ''}`;
}

@Pipe({
  name: 'truncateString'
})
export class TruncateStringPipe implements PipeTransform {
  transform(value: string, length = 350, addEllipsis = true): string {
    return trimString(value, length, addEllipsis);
  }
}

@NgModule({
  declarations: [TruncateStringPipe],
  imports: [CommonModule],
  exports: [TruncateStringPipe]
})
export class TruncateStringModule { }
