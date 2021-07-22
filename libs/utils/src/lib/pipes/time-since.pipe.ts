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
    return this.timeSince(value);
  }

  timeSince(date: Date) {

    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);

    let interval = seconds / (60 * 60 * 24 * 365);

    if (interval > 1) {
      return Math.floor(interval) + " years";
    }
    if (interval >= 1) return Math.floor(interval) + (interval === 1 ? ' month' : ' months');
    interval = seconds / 86400;
    if (interval >= 1) return Math.floor(interval) + (interval === 1 ? ' day' : ' days');
    interval = seconds / 3600;
    if (interval >= 1) return Math.floor(interval) + (interval === 1 ? ' hour' : ' hours');
    interval = seconds / 60;
    if (interval >= 1) return Math.floor(interval) + (interval === 1 ? ' minute' : ' minutes');
    return Math.floor(seconds) + " seconds";
  }
}

@NgModule({
  exports: [TimeSincePipe],
  declarations: [TimeSincePipe],
})
export class TimeSinceModule { }
