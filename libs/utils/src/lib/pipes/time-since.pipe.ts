﻿import { Pipe, PipeTransform } from '@angular/core';
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
      return Math.floor(interval) + $localize` years`;
    }
    interval = Math.floor(seconds / 2592000);
    if (interval >= 1) return `${interval} ${interval === 1 ? $localize` month` : $localize` months`}`;
    interval = Math.floor(seconds / 86400);
    if (interval >= 1) return `${interval} ${interval === 1 ? $localize` day` : $localize` days`}`;
    interval = Math.floor(seconds / 3600);
    if (interval >= 1) return `${interval} ${interval === 1 ? $localize` hour` : $localize` hours`}`;
    interval = Math.floor(seconds / 60);
    if (interval >= 1) return `${interval} ${interval === 1 ? $localize` minute` : $localize` minutes`}`;
    return Math.floor(seconds) + $localize` seconds`;
  }
}

@NgModule({
  exports: [TimeSincePipe],
  declarations: [TimeSincePipe],
})
export class TimeSinceModule { }