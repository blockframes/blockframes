export interface RawRange<D> {
  from: D | null;
  to: D | null;
  label?: string;
}

/** Need it for calendar components */
export interface DateRange extends RawRange<Date> {}

/** check if a date is in a range */
export function isBetween(date: Date, startRange: Date, endRange: Date){
  return date.getTime() >= startRange.getTime() && date.getTime() <= endRange.getTime();
}

