import { Pipe, PipeTransform } from '@angular/core';
import { NgModule } from '@angular/core';

@Pipe({
  name: 'timesince'
})
export class TimeSincePipe implements PipeTransform {
  /**
   * Converting the date to seconds, minutes, hours, months and years from the date created
   * Example: "1 hour ago"
   */
  transform(date: Date) {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);

    let interval = seconds / (60 * 60 * 24 * 365);
    const d = new Date();
    d.setMonth(d.getMonth() - 3);

    if (interval > 1) {
      return Math.floor(interval) + " years";
    }
    interval = seconds / 2592000;
    if (interval >= 1)  return (Math.floor(interval) + (interval < 2 || interval === 0 ? ' month' : ' months'));
    interval = seconds / 86400;
    if (interval >= 1) return (Math.floor(interval) + (interval < 2 || interval === 0 ? ' day' : ' days'));
    interval = seconds / 3600;
    if (interval >= 1) return Math.floor(interval) + (interval < 2 || interval === 0 ? ' hour' : ' hours');
    interval = seconds / 60;
    if (interval >= 1) return Math.floor(interval) + (interval < 2 || interval === 0 ? ' minute' : ' minutes');
    return Math.floor(seconds) + " seconds";
  }
}

@NgModule({
  exports: [TimeSincePipe],
  declarations: [TimeSincePipe],
})
export class TimeSinceModule { }
