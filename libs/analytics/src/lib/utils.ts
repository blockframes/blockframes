import { Organization, Analytics, Scope, createAggregatedAnalytic, AggregatedAnalytic, User, toLabel, AnalyticData } from '@blockframes/model';
import { getDeepValue } from '@blockframes/utils/pipes';

/**
 * Counts number of occurances
 * @param array 
 * @param keyPath Path to key in object that needs to be counted.
 * @param deltaFn Function Path to array in object that resembles the number of occurances that need to be counted.
 * @example 
 * // Count number of analytics per genre in array of analytics joined with Movie.
 * counter(analytics, 'title.genres')
 * @example
 * // Count number of analytics per genre in array of Movies joined with Analytics.
 * counter(movies, 'genres', (item) => item.analytics.length )
 * @returns A record
 */
export function counter<T = unknown>(array: T[], keyPath: string, deltaFn?: (item: T) => number) {  
  const counter: Record<string | number, number> = {};

  const count = (key: string | number, delta: number) => {
    if (!counter[key]) counter[key] = 0;
    counter[key] = counter[key] + delta;
  }

  for (const item of array) {
    const value = getDeepValue(item, keyPath) as string | number | (string | number)[];

    if (!value && value !== 0) continue;
    const delta = deltaFn ? deltaFn(item) : 1;
    Array.isArray(value) ? value.forEach(key => count(key, delta)) : count(value, delta);
  }

  return counter;
}

export function countedToAnalyticData(record: Record<string | number, number>, scope?: Scope): AnalyticData[] {
  return Object.entries(record).map(([key, count]) => ({
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
