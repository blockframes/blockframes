import { Pipe, PipeTransform } from '@angular/core';
import { NgModule } from '@angular/core';
import { convertToTimeString } from '../helpers';

@Pipe({
  name: 'duration'
})
export class DurationPipe implements PipeTransform {
  /**
   * Convert **milliseconds** into a time string.
   * If value is 0 or incorrect the `placeholder` will be returned.
   *
   * Default `placeholder` is 'TBC'
   *
   * `{{60 * 1000 | duration}} // '1min'`
   */
  transform(value: number, placeholder = 'TBC') {
    if (
      !value ||
      typeof value !== 'number' ||
      Number.isNaN(value) ||
      !Number.isFinite(value) ||
      value < 0
    ) {
      return placeholder;
    }
    return convertToTimeString(value);
  }
}

@Pipe({
  name: 'timecode'
})
export class TimecodePipe implements PipeTransform {
  /** Takes a number of **seconds** and format it into `hh:mm:ss` */
  transform(value: number) {

    if(typeof value !== 'number' || Number.isNaN(value) || !Number.isFinite(value) || value < 0) {
      console.warn(`TIMECODE PIPE ERROR : value must be a positive finite number but got ${value}`);
    }

    return new Date(value * 1000).toISOString().substr(11, 8);
  }
}

@NgModule({
  exports: [DurationPipe, TimecodePipe],
  declarations: [DurationPipe, TimecodePipe],
})
export class DurationModule { }
