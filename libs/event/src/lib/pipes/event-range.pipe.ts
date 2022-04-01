import { Pipe, PipeTransform, NgModule } from '@angular/core';
import { formatDate } from '@angular/common';
import { Event } from '@blockframes/shared/model';
import { isSameMonth, isSameDay, isSameYear } from 'date-fns';

@Pipe({ name: 'eventRange', pure: true })
export class EventRangePipe implements PipeTransform {
  transform({ start, end }: Event) {
    const from = formatDate(start, 'h:mm a', 'en');
    const to = formatDate(end, 'h:mm a', 'en');
    const gmt = formatDate(start, 'O', 'en');

    const time = `\n${from} - ${to}, ${gmt}`; // Use <pre>{{ | eventRange }}</pre> to take advantage of \n

    if (isSameDay(start, end)) {
      return `${formatDate(start, 'EEEE, MMMM d, y', 'en')} ${time}`;
    }
    if (isSameMonth(start, end)) {
      return `${start.getDate()} - ${formatDate(end, 'd MMMM, y', 'en')} ${time}`;
    }
    if (isSameYear(start, end)) {
      return `${formatDate(start, 'MMMM d', 'en')} - ${formatDate(end, 'MMMM d', 'en')}, ${end.getFullYear()} ${time}`;
    }
    return `${formatDate(start, 'MMMM d y', 'en')} - ${formatDate(start, 'MMMM d y', 'en')} ${time}`;
  }
}

@NgModule({
  declarations: [EventRangePipe],
  exports: [EventRangePipe],
})
export class EventRangeModule {}
