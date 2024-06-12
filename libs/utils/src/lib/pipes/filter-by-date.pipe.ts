import { Pipe, PipeTransform, NgModule } from '@angular/core';
import { formatDate } from '@angular/common';
import { add, startOfDay } from 'date-fns/fp'
import { Event, TimeFrame, getTimeFrames } from '@blockframes/model';
import { getValue } from '../helpers';

function filterByDate(value: unknown[], timeFrame: TimeFrame, key = 'date', keyFinish?: string) {
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
  transform(value: unknown[], timeFrame: TimeFrame, key = 'date', keyFinish?: string) {
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
    const timeFrames = getTimeFrames(order);
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
