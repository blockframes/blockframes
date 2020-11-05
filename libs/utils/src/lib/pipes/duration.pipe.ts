import { Pipe, PipeTransform } from '@angular/core';
import { NgModule } from '@angular/core';

@Pipe({
  name: 'duration'
})
export class DurationPipe implements PipeTransform {
  transform(value: number | string | { start: number | Date, end: number | Date },
    base: 'ms' | 's' | 'min' = 'min', placeholder = 'TBC') {
    if (!value) {
      return placeholder;
    }
    if (typeof value === 'string') {
      return value;
    }
    if (typeof value === 'number') {
      switch (base) {
        // Our base for converting are milliseconds
        case 'ms':
          return this.convertToTimeString(value);
        case 's':
          return this.convertToTimeString(value * 1000);
        case 'min':
          return this.convertToTimeString(value * 60000);
      }
    }
    if (typeof value === 'object' && 'start' in value && 'end' in value) {
      const start = new Date(value.start).getTime();
      const end = new Date(value.end).getTime();
      const difference = Math.abs(end - start);
      return this.convertToTimeString(difference);
    } 
  }

  convertToTimeString(time: number) {
    let day: number, hour: number, minute: number, second: number;
    second = Math.floor(time / 1000);
    minute = Math.floor(second / 60);
    second = second % 60;
    hour = Math.floor(minute / 60);
    minute = minute % 60;
    day = Math.floor(hour / 24);
    hour = hour % 24;
    hour += day * 24;
    // If the previous number is 0, do not show next smaller one
    return (hour > 0 ? hour + 'h ' : '') + (minute > 0 && hour > 0 ? minute + 'min' : '') + 
      (second > 0 && minute > 0 ? second + 's' : '');
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
