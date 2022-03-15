import { User, Organization, Movie } from "@blockframes/model";
import { DocumentMeta } from "@blockframes/utils/models-meta";

const analyticsEvents = [
  'pageView',
  'promoReelOpened',
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

export interface AggregatedAnalytic extends Record<EventName, number> {
  user?: User;
  org?: Organization;
  title?: Movie;
}

// FireAnalytics
export interface AnalyticsUserProperties {
  browser_name: string;
  browser_version: string;
}