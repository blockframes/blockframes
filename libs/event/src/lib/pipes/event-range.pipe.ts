import { Pipe, PipeTransform, NgModule } from '@angular/core';
import { formatDate } from '@angular/common';
import { Event } from '../+state/event.model';
import { isSameMonth, isSameDay, isSameYear } from 'date-fns';

@Pipe({ name: 'eventRange', pure: true })
export class EventRangePipe implements PipeTransform {
  transform({ start, end }: Event) {
    if (isSameDay(start, end)) {
      const day = formatDate(start, 'EEEE, MMMM d, y', 'en');
      const from = formatDate(start, 'h:mm a', 'en');
      const to = formatDate(start, 'h:mm a', 'en');
      const gmt = formatDate(start, 'zzzz', 'en');
      return `${day}, from ${from} to ${to} ${gmt}`;
    }
    if (isSameMonth(start, end)) {
      return `${start.getDate()} - ${formatDate(end, 'd MMMM, y','en')}`;
    }
    if (isSameYear(start, end)) {
      return `${formatDate(start, 'MMMM d', 'en')} - ${formatDate(end, 'MMMM d', 'en')}, ${end.getFullYear()}`;
    }
    return `${formatDate(start, 'MMMM d y', 'en')} - ${formatDate(start, 'MMMM d y', 'en')}`;
  }
}

@NgModule({
  declarations: [EventRangePipe],
  exports: [EventRangePipe]
})
export class EventRangeModule {}