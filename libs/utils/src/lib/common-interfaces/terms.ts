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
  floatingStart?: string;
  /**
   * @example: 1 year after floatingStart event occured
   */
  floatingDuration?: string;
}

export interface Terms extends TermsRaw<Date> {
}

export function createTerms(params: Partial<Terms> = {}): Terms {
  return {
    ...params
  };
}
