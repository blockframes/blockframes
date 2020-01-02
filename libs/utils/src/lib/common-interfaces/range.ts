export interface RawRange<D> {
  from: D | null;
  to: D | null;
}

/** Need it for calendar components */
export interface DateRange extends RawRange<Date> {}
export interface NumberRange extends RawRange<Number> {}

/** check if a date is in a range */
export function isBetween(date: Date, startRange: Date, endRange: Date){
  return date.getTime() >= startRange.getTime() && date.getTime() <= endRange.getTime();
}

export function createRange<D>(params: Partial<RawRange<D>> = {}): RawRange<D> {
  return {
    from: null,
    to: null,
    ...params
  };
}
