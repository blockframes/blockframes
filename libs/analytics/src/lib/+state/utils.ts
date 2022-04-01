import { Organization, Analytics, AnalyticsTypes } from "@blockframes/model";
import { getDeepValue, toLabel } from "@blockframes/utils/pipes";
import { Scope } from "@blockframes/shared/model";

interface AnalyticsWithOrg extends Analytics<AnalyticsTypes> {
  org?: Organization
}

export interface AnalyticData {
  key: string;
  count: number;
  label: string;
}

/**
 * Counts number of occurances in analytics
 * @param path Path to value in object that needs to be counted. This value has to be of type string or number
 */
export function counter(analytics: AnalyticsWithOrg[], path: string, scope?: Scope): AnalyticData[] {
  const counter: Record<string | number, number> = {};
  for (const analytic of analytics) {
    const key = getDeepValue(analytic, path) as string | number;
    if (!key) continue;
    if (!counter[key]) counter[key] = 0;
    counter[key]++;
  }

  return Object.entries(counter).map(([key, count]) => ({
    key,
    count,
    label: scope ? toLabel(key, scope) : ''
  }));
}
