import {
  Organization,
  Analytics,
  Scope,
  createAggregatedAnalytic,
  AggregatedAnalytic,
  User,
  toLabel,
  AnalyticData,
  Invitation,
  averageWatchDuration,
  EventName,
  AnalyticsInteraction
} from '@blockframes/model';
import { convertToTimeString } from '@blockframes/utils/helpers';
import { getDeepValue } from '@blockframes/utils/pipes';
import { IconSvg } from '@blockframes/ui/icon.service';

/**
 * Counts number of occurances
 * @param array 
 * @param keyPath Path to key in object that needs to be counted.
 * @param deltaFn Function that returns the delta with which to count. For example a length of an array or an already aggrigated number.
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

  aggregated.interactions.global = aggregateInteractions(analytics);
  aggregated.interactions.festival = aggregateInteractions(analytics.filter(a => a._meta.createdFrom === 'festival'));
  aggregated.interactions.catalog = aggregateInteractions(analytics.filter(a => a._meta.createdFrom === 'catalog'));

  return aggregated;
}

function aggregateInteractions(analytics: Analytics[]): AnalyticsInteraction {
  const sorted = analytics.sort(sortByDate);
  return {
    count: sorted.length,
    first: sorted[0] ? sorted[0]._meta.createdAt : undefined,
    last: sorted[sorted.length - 1] ? sorted[sorted.length - 1]._meta.createdAt : undefined,
  };
}

export function aggregatePerUser(analytics: (Analytics<'title'> & { user: User, org: Organization })[]) {
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

export interface MetricCard {
  title: string;
  value: number | string;
  icon: string;
  selected?: boolean;
}

export function toScreenerCards(invitations: Invitation[]): MetricCard[] {
  const attendees = invitations.filter(invitation => invitation.watchInfos?.duration !== undefined);
  const accepted = invitations.filter(invitation => invitation.status === 'accepted');

  const avgWatchDuration = averageWatchDuration(attendees);
  const parsedTime = convertToTimeString(avgWatchDuration * 1000);
  const participationRate = accepted.length ? Math.round((attendees.length / accepted.length) * 100) : 0;
  const acceptationRate = invitations.length ? Math.round((accepted.length / invitations.length) * 100) : 0;
  const requestCount = invitations.filter(i => i.mode === 'request').length;
  const traction = invitations.length ? Math.round((requestCount / invitations.length) * 100) : 0;
  return [
    {
      title: 'Guests',
      value: invitations.length,
      icon: 'badge'
    },
    {
      title: 'Attendees',
      value: attendees.length,
      icon: 'group'
    },
    {
      title: 'Average Watch Time',
      value: parsedTime,
      icon: 'timer'
    },
    {
      title: 'Participation Rate',
      value: invitations.length ? `${participationRate}%` : '-',
      icon: 'front_hand'
    },
    {
      title: 'Acceptation Rate',
      value: invitations.length ? `${acceptationRate}%` : '-',
      icon: 'sentiment_satisfied'
    },
    {
      title: 'Traction Rate',
      value: invitations.length ? `${traction}%` : '-',
      icon: 'magnet_electricity'
    }
  ];
}

interface VanityMetricEvent {
  name: EventName;
  title: string;
  icon: IconSvg;
};

export const events: VanityMetricEvent[] = [
  {
    name: 'pageView',
    title: 'Views',
    icon: 'visibility'
  },
  {
    name: 'promoElementOpened',
    title: 'Video Plays',
    icon: 'star_fill'
  },
  {
    name: 'addedToWishlist',
    title: 'Adds to Wishlist',
    icon: 'favorite'
  },
  {
    name: 'screeningRequested',
    title: 'Screening Requested',
    icon: 'ask_screening_2'
  },
  {
    name: 'askingPriceRequested',
    title: 'Asking Price Requested',
    icon: 'local_offer'
  }
];

export function toCards(aggregated: AggregatedAnalytic): MetricCard[] {
  return events.map(event => ({
    title: event.title,
    value: aggregated[event.name],
    icon: event.icon,
    selected: false
  }));
}

function sortByDate(a: Analytics, b: Analytics): number {
  if (a._meta.createdAt.getTime() < b._meta.createdAt.getTime()) return -1;
  if (a._meta.createdAt.getTime() > b._meta.createdAt.getTime()) return 1;
  return 0;
}