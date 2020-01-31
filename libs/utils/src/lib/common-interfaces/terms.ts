export enum Event {
  ContractSignatureDate = 'Contract Signature Date',
  WordlPremiere = 'World Premiere',
  AcceptationAllMaterials = 'Acceptation of all delivery materials',
  FirstTheatricalRelease = 'First theatrical release',
  FirstTvBroadcast = 'First TV broadcast',
  InvoiceEmittedDate ='Invoice emission date',
}

export enum TimeUnit {
  days = 'Days',
  weeks = 'Weeks',
  months = 'Months',
  years = 'years'
}

export enum TemporalityUnit {
  after = 'After',
  before = 'Before',
  for = 'For'
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
  floatingStart?: Event;
  /**
   * @example: 1 year after floatingStart event occured
   */
  floatingDuration?: FloatingDuration;
}

export interface ScheduledDateRaw<D> extends TermsRaw<D> {
  dueDate: D,
  period: FloatingDuration, // @dev this replace floatingDuration for better readability
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
