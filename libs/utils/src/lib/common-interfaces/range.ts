export interface RawRange<D> {
  from: D | null;
  to: D | null;
  label?: string;
}

/** Need it for calendar components */
export interface DateRange extends RawRange<Date> {}
export interface NumberRange extends RawRange<number> {}

/** check if a date is in a range */
export function isBetween(date: Date, startRange: Date, endRange: Date){
  return date.getTime() >= startRange.getTime() && date.getTime() <= endRange.getTime();
}

export function createRange<D>(params: Partial<RawRange<D>> = {}): RawRange<D> {
  return {
    from: null,
    to: null,
    label: '',
    ...params
  };
}
