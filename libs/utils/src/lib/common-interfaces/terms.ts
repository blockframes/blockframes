export interface TermsRaw<D> {
  start?: D | null;
  startLag?: string; // IE: 3 months around start
  end?: D | null;
  endLag?: string; // IE: 3 months around end
  floatingStart?: string; // IE: 7 months after theatrical release
  floatingDuration?: string; // IE: 1 year after floatingStart event occured
}

export interface Terms extends TermsRaw<Date> {
}

export function createTerms(params: Partial<Terms> = {}): Terms {
  return {
    ...params
  };
}
