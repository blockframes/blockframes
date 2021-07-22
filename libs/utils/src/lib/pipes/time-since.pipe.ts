import { Pipe, PipeTransform } from '@angular/core';
import { NgModule } from '@angular/core';

@Pipe({
  name: 'timesince'
})
export class TimeSincePipe implements PipeTransform {
  /**
   * Convert the date to numbers from the time display
   * Example: "1 hour ago"
   */
  transform(value: Date) {
    return this.convertToTimeString(value);
  }

  convertToTimeString(date: Date) {

    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);

    let interval = seconds / 31536000;

    if (interval > 1) {
      return Math.floor(interval) + " years";
    }
    interval = seconds / 2592000;
    if (interval > 1) {
      return Math.floor(interval) + " months";
    }
    interval = seconds / 86400;
    if (interval > 1) {
      return Math.floor(interval) + " days";
    }
    interval = seconds / 3600;
    if (interval > 1) {
      return Math.floor(interval) + " hours";
    }
    interval = seconds / 60;
    if (interval > 1) {
      return Math.floor(interval) + " minutes";
    }
    return Math.floor(seconds) + " seconds";
  }
}

@NgModule({
  exports: [TimeSincePipe],
  declarations: [TimeSincePipe],
})
export class TimeSinceModule { }
