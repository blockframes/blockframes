const analyticsEvents = [
  'removedFromWishlist',
  'addedToWishlist',
  'promoReelOpened',
  'pageView',
  'screeningRequested',
  'askingPriceRequested'
] as const;

export type AnalyticsEvents = typeof analyticsEvents[number];

export interface AnalyticsUserProperties {
  browser_name: string;
  browser_version: string;
}

export interface AnalyticsBase {
  id: string;
  type: 'movie',
}
