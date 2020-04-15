import { Pipe, PipeTransform, NgModule } from '@angular/core';
import { formatDate } from '@angular/common';
import { sub } from 'date-fns/fp'

export interface TimeFrame {
  label?: string;
  type: 'days' | 'weeks' | 'months' | 'years';
  from: number;
  to?: number;
}

export const timeFrames: TimeFrame[] = [
  { type: 'days', from: 0, to: 1, label: 'Today' },
  { type: 'days', from: 1, to: 2, label: 'Yesterday' },
  { type: 'days', from: 2, to: 3 },
  { type: 'days', from: 3, to: 4 },
  { type: 'days', from: 4, to: 5 },
  { type: 'days', from: 5, to: 6 },
  { type: 'days', from: 6, to: 7 },
  { type: 'weeks', from: 1, to: 2, label: 'Last Week' },
  { type: 'weeks', from: 2, to: 3 },
  { type: 'weeks', from: 3, to: 4 },
  { type: 'months', from: 1, to: 2, label: 'Last Month' },
  { type: 'months', from: 2, to: 3 },
  { type: 'months', from: 3, to: 4 },
];

@Pipe({ name: 'filterByDate', pure: true })
export class FilterByDatePipe implements PipeTransform {
  /**
   * Get only the sublist
   * @param value A list to order by date
   * @param from The date to start (today => 0, yesterday => 1)
   * @param to The date to stop (today => 0, yesterday => 1)
   * @param key The key where to find the date value
   */
  transform(value: any[], timeFrame: TimeFrame, key: string = 'date') {
    const { from, to, type } = timeFrame;
    const now = Date.now();
    const fromDate = sub({ [type]: from }, now);
    const toDate = sub({ [type]: to }, now);
    return value.filter(v => v[key] <= fromDate && v[key] > toDate);
  }
}

@Pipe({ name: 'labelByDate', pure: true })
export class LabelByDatePipe implements PipeTransform {
  transform(timeFrame: TimeFrame): string {
    const { from, label, type } = timeFrame;
    if (label) {
      return label;
    }
    const fromDate = sub({ [type]: from }, Date.now());
    switch (type) {
      case 'days': return formatDate(fromDate, 'EEEE', 'en');
      case 'weeks': return formatDate(fromDate, 'MMMM d', 'en');
      case 'days': return formatDate(fromDate, 'MMMM', 'en');
      case 'years': return formatDate(fromDate, 'longDate', 'en');
    } 
  }
}

@NgModule({
  declarations: [FilterByDatePipe, LabelByDatePipe],
  exports: [FilterByDatePipe, LabelByDatePipe]
})
export class FilterByDateModule {}