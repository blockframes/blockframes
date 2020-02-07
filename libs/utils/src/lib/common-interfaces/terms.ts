import { formatDate } from '@angular/common';

export enum PaymentEvent {
  ContractSignatureDate = 'Contract Signature Date',
  AcceptationAllMaterials = 'Acceptation of all delivery materials',
  InvoiceEmittedDate ='Invoice emission date',
}

export enum MovieEvent {
  WordlPremiere = 'World Premiere',
  FirstTheatricalRelease = 'First theatrical release',
  FirstTvBroadcast = 'First TV broadcast',
}

export enum TimeUnit {
  days = 'Days',
  weeks = 'Weeks',
  months = 'Months',
  years = 'Years',
  calendarSemester= 'Calendar Semester',
  calendarQuarter= 'Calendar Quarter'
}

export enum TemporalityUnit {
  after = 'After',
  before = 'Before',
  for = 'For',
  every= 'Every'
}

export interface FloatingDuration {
  label?: string;
  duration?: number;
  unit?: TimeUnit,
  temporality?: TemporalityUnit,
}

export interface TermsRaw<D> {
  start?: D;
  approxStart?: string;
  /**
   * @example: 3 months around start
   */
  startLag?: string;
  end?: D;
  approxEnd?: string;
  /**
   * @example: 3 months around end
   */
  endLag?: string;
  /**
   * @example: 7 months after theatrical release
   */
  floatingStart?: MovieEvent | PaymentEvent;
  /**
   * @example: 1 year after floatingStart event occured
   */
  floatingDuration?: FloatingDuration;
}

export interface ScheduledDateRaw<D> extends TermsRaw<D> {
  dueDate: D,
  period: FloatingDuration,
}

/**
 * A ScheduledDateRaw interface with a counter to keep schedule order
 */
export interface ScheduledDateWithCounterRaw<D> extends ScheduledDateRaw<D> {
  count: number;
}

export interface Terms extends TermsRaw<Date> {
}

export interface ScheduledDate extends ScheduledDateRaw<Date> {
}

export interface ScheduledDateWithCounter extends ScheduledDateWithCounterRaw<Date> {
}

export function createFloatingDuration(params: Partial<FloatingDuration> = {}): FloatingDuration {
  return {
    ...params
  };
}

export function createTerms(params: Partial<Terms> = {}): Terms {
  return {
    ...params
  };
}

export function createScheduledDate(params: Partial<ScheduledDate> = {}): ScheduledDate {
  return {
    dueDate: new Date(),
    ...params,
    period: createFloatingDuration(params.period),
  };
}

export function createScheduledDateWithCounter(params: Partial<ScheduledDateWithCounter> = {}): ScheduledDateWithCounter {
  return {
    count: 0,
    ...params,
    ...createScheduledDate(params),
  };
}

export function termToPrettyDate(term: Terms, type: 'start' | 'end' = 'start'): string {
  const noDate = 'no date';
  switch (type) {
    case 'start':
      if (!term.start || isNaN(term.start.getTime())) {
        return term.approxStart || noDate;
      } else if (term.start) {
        return formatDate(term.start, 'yyyy-MM-dd', 'en-US');
      } else {
        return noDate;
      }
    case 'end':
    default:
      if (!term.end || isNaN(term.end.getTime())) {
        return term.approxEnd || noDate;
      } else if (term.end) {
        return formatDate(term.end, 'yyyy-MM-dd', 'en-US');
      } else {
        return noDate;
      }
  }
}
