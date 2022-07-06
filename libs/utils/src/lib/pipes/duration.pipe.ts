import { Pipe, PipeTransform } from '@angular/core';
import { NgModule } from '@angular/core';
import { convertToTimeString } from '../helpers';

@Pipe({
  name: 'duration'
})
export class DurationPipe implements PipeTransform {
  /**
   * Convert **milliseconds** into a time string.
   * `{{ 60 * 1000 | duration }} // '1min'`
   */
  transform(value: number, falback = '-') {
    if (isNaN(value)) return falback;
    return convertToTimeString(value);
  }
}

@Pipe({
  name: 'timecode'
})
export class TimecodePipe implements PipeTransform {
  /** Takes a number of **seconds** and format it into `hh:mm:ss` */
  transform(value: number) {

    if (typeof value !== 'number' || Number.isNaN(value) || !Number.isFinite(value) || value < 0) {
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
