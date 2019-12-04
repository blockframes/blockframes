export interface DateRangeRaw<D> {
  from: D | null;
  to: D | null;
}

/** Need it for calendar components */
export interface DateRange extends DateRangeRaw<Date> {
}

/** check if a date is in a range */
export function isBetween(date: Date, startRange: Date, endRange: Date){
  return date.getTime() >= startRange.getTime() && date.getTime() <= endRange.getTime();
}

export function createDateRange(params: Partial<DateRange> = {}): DateRange {
  return {
    from: null,
    to: null,
    ...params
  };
}
