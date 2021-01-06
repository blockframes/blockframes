export const analyticsEvents = [
  'removedFromWishlist',
  'addedToWishlist',
  'wishlistSend',
  'removedSalesAgent',
  'addedSalesAgent',
  'addedGenre',
  'removedGenre',
  'addedLanguage',
  'removedLanguage',
  'removedMovieStatus',
  'addedMovieStatus',
  'searchbarSearchType',
  'promoReelOpened',
  'pageView',
] as const;

export type AnalyticsEvents = typeof analyticsEvents[number];

export const analyticsUserProperties = [
  'browser_name',
  'browser_version'
] as const;

export type AnalyticsUserProperties = typeof analyticsUserProperties[number];