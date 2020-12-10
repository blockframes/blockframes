import { Pipe, PipeTransform } from '@angular/core';
import { NgModule } from '@angular/core';

@Pipe({
  name: 'duration'
})
export class DurationPipe implements PipeTransform {
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

    return this.convertToTimeString(value);
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

    const dayStr = day > 0 ? `${day}d` : '';
    const hourStr = hour > 0 ? `${hour}h` : '';
    const minuteStr = minute > 0 ? `${minute}min` : '';
    const secondStr = second > 0 ? `${second}s` : '';

    return `${dayStr}${hourStr}${minuteStr}${secondStr}`;
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
