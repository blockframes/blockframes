import { DocumentMeta } from "@blockframes/utils/models-meta";

const analyticsEvents = [
  'pageView',
  'promoVideoStarted',
  'addedToWishlist',
  'removedFromWishlist',
  'promoElementOpened',
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
  _meta?: DocumentMeta<Date>;
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

// FireAnalytics
export interface AnalyticsUserProperties {
  browser_name: string;
  browser_version: string;
}