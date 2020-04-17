import { Pipe, PipeTransform, NgModule } from '@angular/core';
import { formatDate } from '@angular/common';
import { Event } from '../+state/event.model';
import { isSameMonth, isSameDay, isSameYear } from 'date-fns';

function getTime(date: Date): string {
  const h = ('0' + date.getHours()).slice(-2);
  const m = ('0' + date.getMinutes()).slice(-2);
  return `${h}:${m}`
}

@Pipe({ name: 'eventRange', pure: true })
export class EventRangePipe implements PipeTransform {
  transform({ start, end }: Event) {
    if (isSameDay(start, end)) {
      return `${formatDate(start, 'fullDate', 'en')}, from ${getTime(start)} to ${getTime(end)}`;
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