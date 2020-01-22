export enum Event {
  ContractSignatureDate = 'Contract Signature Date',
  WordlPremiere = 'World Premiere',
  AcceptationAllMaterials = 'Acceptation of all delivery materials',
  FirstTheatricalRelease = 'First theatrical release',
  FirstTvBroadcast = 'First TV broadcast'
}

export enum TimeUnit {
  days = 'Days',
  weeks = 'Weeks',
  months = 'Months',
  years = 'years'
}

export interface FloatingDuration {
  label?: string;
  duration?: number;
  unit?: 'days' | 'weeks' | 'months' | 'years' 
}

export interface TermsRaw<D> {
  start?: D ;
  /**
   * @example: 3 months around start
   */
  startLag?: string;
  end?: D;
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

export interface Terms extends TermsRaw<Date> {
}

export function createTerms(params: Partial<Terms> = {}): Terms {
  return {
    ...params
  };
}
