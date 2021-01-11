import { Pipe, PipeTransform, NgModule } from '@angular/core';
import { formatDate } from '@angular/common';
import { add, startOfDay } from 'date-fns/fp'

export interface TimeFrame {
  label?: string;
  type: 'days' | 'weeks' | 'months' | 'years';
  from: number;
  to?: number;
}

export const descTimeFrames: TimeFrame[] = [
  { type: 'days', from: 0, to: 1, label: 'Today' },
  { type: 'days', from: -1, to: 0, label: 'Yesterday' },
  { type: 'days', from: -2, to: -1 },
  { type: 'days', from: -3, to: -2 },
  { type: 'days', from: -4, to: -3 },
  { type: 'days', from: -5, to: -4 },
  { type: 'days', from: -6, to: -5 },
  { type: 'weeks', from: -2, to: -1, label: 'Last Week' },
  { type: 'weeks', from: -3, to: -2 },
  { type: 'weeks', from: -4, to: -3 },
  { type: 'months', from: -2, to: -1, label: 'Last Month' },
  { type: 'months', from: -3, to: -2 },
  { type: 'months', from: -4, to: -3 },
];

export const ascTimeFrames: TimeFrame[] = [
  { type: 'days', from: 0, to: 1, label: 'Today' },
  { type: 'days', from: 1, to: 2, label: 'Tomorrow' },
  { type: 'days', from: 2, to: 3 },
  { type: 'days', from: 3, to: 4 },
  { type: 'days', from: 4, to: 5 },
  { type: 'days', from: 5, to: 6 },
  { type: 'days', from: 6, to: 7 },
  { type: 'weeks', from: 1, to: 2, label: 'Next Week' },
  { type: 'weeks', from: 2, to: 3 },
  { type: 'weeks', from: 3, to: 4 },
  { type: 'months', from: 1, to: 2, label: 'Next Month' },
  { type: 'months', from: 2, to: 3 },
  { type: 'months', from: 3, to: 4 },
];

function filterByDate(value: any[], timeFrame: TimeFrame, key: string = 'date', keyFinish?: string) {
  if (!Array.isArray(value)) {
    return value;
  }
  const { from, to, type } = timeFrame;
  const now = startOfDay(Date.now());
  const fromDate = add({ [type]: from }, now);
  const toDate = add({ [type]: to }, now);
  return value.filter(v => {
    if (!!keyFinish) {
      return v[key] < toDate && v[keyFinish] >= fromDate;
    }
    return v[key] >= fromDate && v[key] < toDate;
  });
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
  transform(value: any[], timeFrame: TimeFrame, key: string = 'date', keyFinish?: string) {
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
      case 'weeks': return formatDate(fromDate, 'MMMM d', 'en');
      case 'days': return formatDate(fromDate, 'MMMM', 'en');
      case 'years': return formatDate(fromDate, 'longDate', 'en');
    }
  }
}

@Pipe({ name: 'eventsToTimeFrame', pure: true })
export class EventsToTimeFramePipe implements PipeTransform {
  transform(events: Event[], order: 'asc' | 'desc' = 'asc') {
    const timeFrames = order === 'asc' ? ascTimeFrames : descTimeFrames;
    return timeFrames.map(timeFrame => {
      timeFrame['events'] = filterByDate(events, timeFrame, 'start', 'end');
      return timeFrame
    }).filter(timeFrame => !!timeFrame['events']?.length)
  }
}

@NgModule({
  declarations: [FilterByDatePipe, LabelByDatePipe, EventsToTimeFramePipe],
  exports: [FilterByDatePipe, LabelByDatePipe, EventsToTimeFramePipe]
})
export class FilterByDateModule {}
