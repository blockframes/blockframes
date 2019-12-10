export interface TermsRaw<D> {
  start?: D | null;
  startLag?: string; // @example: 3 months around start
  end?: D | null;
  endLag?: string; // @example: 3 months around end
  floatingStart?: string; // @example: 7 months after theatrical release
  floatingDuration?: string; // @example: 1 year after floatingStart event occured
}

export interface Terms extends TermsRaw<Date> {
}

export function createTerms(params: Partial<Terms> = {}): Terms {
  return {
    ...params
  };
}
