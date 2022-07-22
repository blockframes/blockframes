import { DocumentMeta } from './meta';
import { Movie } from './movie';
import { Organization } from './organisation';
import { User } from './user';

const analyticsEvents = [
  'pageView',
  'promoElementOpened',
  'addedToWishlist',
  'removedFromWishlist',
  'screeningRequested',
  'askingPriceRequested'
] as const;
export type EventName = typeof analyticsEvents[number];

export interface AnalyticsTypeRecord {
  title: MetaTitle;
  event: MetaEvent;
}

export type AnalyticsTypes = keyof AnalyticsTypeRecord;

export interface Analytics<type extends AnalyticsTypes = AnalyticsTypes> {
  id: string;
  name: EventName;
  type: type;
  meta: AnalyticsTypeRecord[type];
  _meta?: DocumentMeta;
}

export interface MetaTitle {
  titleId: string;
  orgId: string;
  uid: string;
  ownerOrgIds: string[];
}

export interface MetaEvent {
  eventId: string;
  uid: string;
  orgId?: string;
  ownerOrgId: string;
}

export interface AggregatedAnalytic extends Record<EventName, number> {
  total: number;
  user?: User;
  org?: Organization;
  title?: Movie;
}

export interface AnalyticsWithOrg extends Analytics<AnalyticsTypes> {
  org?: Organization;
}

export interface AnalyticData {
  key: string;
  count: number;
  label: string;
}

// FireAnalytics
export interface AnalyticsUserProperties {
  browser_name: string;
  browser_version: string;
}

export function createTitleMeta(meta: Partial<MetaTitle>): MetaTitle {
  return {
    titleId: '',
    orgId: '',
    uid: '',
    ownerOrgIds: [],
    ...meta
  };
};

export function createAggregatedAnalytic(analytic: Partial<AggregatedAnalytic>): AggregatedAnalytic {
  return {
    total: 0,
    addedToWishlist: 0,
    askingPriceRequested: 0,
    pageView: 0,
    promoElementOpened: 0,
    removedFromWishlist: 0,
    screeningRequested: 0,
    ...analytic
  };
}
