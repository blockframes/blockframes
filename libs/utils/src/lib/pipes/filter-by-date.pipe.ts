import { Pipe, PipeTransform, NgModule } from '@angular/core';
import { formatDate } from '@angular/common';
import { add, startOfDay } from 'date-fns/fp'
import { Event } from '@blockframes/model';
import { getValue } from '../helpers';

interface TimeFrame {
  label?: string;
  type: 'days' | 'weeks' | 'months' | 'years';
  from: number;
  to?: number;
  way: 'asc' | 'desc';
}

export const descTimeFrames: TimeFrame[] = [
  { type: 'days', from: 0, to: 1, label: 'Today', way: 'desc' },
  { type: 'days', from: -1, to: 0, label: 'Yesterday', way: 'desc' },
  { type: 'days', from: -2, to: -1, way: 'desc' },
  { type: 'days', from: -3, to: -2, way: 'desc' },
  { type: 'days', from: -4, to: -3, way: 'desc' },
  { type: 'days', from: -5, to: -4, way: 'desc' },
  { type: 'days', from: -6, to: -5, way: 'desc' },
  { type: 'weeks', from: -1, to: 0, label: 'Last Week', way: 'desc' },
  { type: 'weeks', from: -2, to: -1, way: 'desc' },
  { type: 'weeks', from: -3, to: -2, way: 'desc' },
  { type: 'weeks', from: -4, to: -3, way: 'desc' },
  { type: 'months', from: -2, to: -1, label: 'Last Month', way: 'desc' },
  { type: 'months', from: -3, to: -2, way: 'desc' },
  { type: 'months', from: -4, to: -3, way: 'desc' },
];

export const ascTimeFrames: TimeFrame[] = [
  { type: 'days', from: 0, to: 1, label: 'Today', way: 'asc' },
  { type: 'days', from: 1, to: 2, label: 'Tomorrow', way: 'asc' },
  { type: 'days', from: 2, to: 3, way: 'asc' },
  { type: 'days', from: 3, to: 4, way: 'asc' },
  { type: 'days', from: 4, to: 5, way: 'asc' },
  { type: 'days', from: 5, to: 6, way: 'asc' },
  { type: 'days', from: 6, to: 7, way: 'asc' },
  { type: 'weeks', from: 1, to: 2, label: 'Next Week', way: 'asc' },
  { type: 'weeks', from: 2, to: 3, way: 'asc' },
  { type: 'weeks', from: 3, to: 4, way: 'asc' },
  { type: 'months', from: 1, to: 2, label: 'Next Month', way: 'asc' },
  { type: 'months', from: 2, to: 3, way: 'asc' },
  { type: 'months', from: 3, to: 4, way: 'asc' },
];

function filterByDate(value: unknown[], timeFrame: TimeFrame, key: string = 'date', keyFinish?: string) {
  if (!Array.isArray(value)) {
    return value;
  }
  const { from, to, type, way } = timeFrame;
  const now = startOfDay(Date.now());
  const fromDate = add({ [type]: from }, now);
  const toDate = add({ [type]: to }, now);
  return value.filter(v => {
    if (keyFinish) {
      return getValue(v, key) < toDate && getValue(v, keyFinish) >= fromDate;
    }
    return getValue(v, key) >= fromDate && getValue(v, key) < toDate;
  }).sort((a, b) => way === 'asc' ? getValue(a, key) - getValue(b, key) : getValue(b, key) - getValue(a, key))
}

@Pipe({ name: 'filterByDate', pure: true })
export class FilterByDatePipe implements PipeTransform {
  /**
   * Get only the sublist
   * @param value A list to order by date
   * @param timeFrame
   * @param key The key where to find the date value
   * @param keyFinish The key where to find the end date value. If used, date found at key is used as starting date.
   */
  transform(value: unknown[], timeFrame: TimeFrame, key: string = 'date', keyFinish?: string) {
    return filterByDate(value, timeFrame, key, keyFinish);
  }
}

@Pipe({ name: 'labelByDate', pure: true })
export class LabelByDatePipe implements PipeTransform {
  transform(timeFrame: TimeFrame): string {
    const { from, label, type } = timeFrame;
    if (label) {
      return label;
    }
    const now = startOfDay(Date.now());
    const fromDate = add({ [type]: from }, now);
    switch (type) {
      case 'days': return formatDate(fromDate, 'EEEE', 'en');
      case 'weeks': return `Week of ${formatDate(fromDate, 'MMMM d', 'en')}`;
      case 'years': return formatDate(fromDate, 'longDate', 'en');
    }
  }
}

@Pipe({ name: 'eventsToTimeFrame', pure: true })
export class EventsToTimeFramePipe implements PipeTransform {
  transform(events: Event[], order: 'asc' | 'desc' = 'asc') {
    if (!events) return;
    const timeFrames = order === 'asc' ? ascTimeFrames : descTimeFrames;
    return timeFrames.map(timeFrame => {
      timeFrame['events'] = filterByDate(events, timeFrame, 'start', 'end');
      return timeFrame;
    }).filter(timeFrame => timeFrame['events']?.length);
  }
}

@NgModule({
  declarations: [FilterByDatePipe, LabelByDatePipe, EventsToTimeFramePipe],
  exports: [FilterByDatePipe, LabelByDatePipe, EventsToTimeFramePipe]
})
export class FilterByDateModule { }
