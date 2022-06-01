import { Organization, Analytics, Scope, createAggregatedAnalytic, AggregatedAnalytic, User, toLabel, AnalyticsWithOrg, AnalyticData } from '@blockframes/model';
import { getDeepValue } from '@blockframes/utils/pipes';

/**
 * Counts number of occurances in analytics
 * @param path Path to value in object that needs to be counted. This value has to be of type string or number
 */
export function counter(data: Array<unknown>, path: string, scope?: Scope): AnalyticData[] {
  const counter: Record<string | number, number> = {};

  const count = (key: string | number) => {
    if (!counter[key]) counter[key] = 0;
    counter[key]++;
  }

  for (const datum of data) {
    const value = getDeepValue(datum, path) as string | number | (string | number)[];
    if (!value) continue;
    Array.isArray(value) ? value.forEach(count) : count(value);
  }

  return Object.entries(counter).map(([key, count]) => ({
    key,
    count,
    label: scope ? toLabel(key, scope) : key
  }));
}

export function aggregate(analytics: Analytics[], data: Partial<AggregatedAnalytic> = {}) {
  const aggregated = createAggregatedAnalytic(data)
  for (const analytic of analytics) {
    aggregated[analytic.name]++;
  }
  aggregated.total = analytics.length;
  return aggregated;
}

export function aggregatePerUser(analytics: (Analytics<"title"> & { user: User, org: Organization})[]) {
  const aggregator: Record<string, AggregatedAnalytic> = {};
  for (const analytic of analytics) {
    if (!analytic.user?.uid) continue;
    if (!aggregator[analytic.user.uid]) {
      aggregator[analytic.user.uid] = createAggregatedAnalytic({
        user: analytic.user,
        org: analytic.org
      });
    };
    aggregator[analytic.user.uid][analytic.name]++;
  }
  return Object.values(aggregator);
}
