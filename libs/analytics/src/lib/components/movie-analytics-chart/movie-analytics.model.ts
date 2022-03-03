const analyticsEvents = [
  'removedFromWishlist',
  'addedToWishlist',
  'promoReelOpened',
  'pageView',
  'screeningRequested',
  'askingPriceRequested'
] as const;
export type AnalyticsEvents = typeof analyticsEvents[number];

export interface MovieEventAnalytics {
  event_date: string,
  event_name: AnalyticsEvents,
  hits: number,
  movieId: string
}

export interface MovieAnalytics {
  id: string;
  addedToWishlist: {
    current: MovieEventAnalytics[],
    past: MovieEventAnalytics[]
  },
  movieViews: {
    current: MovieEventAnalytics[],
    past: MovieEventAnalytics[]
  },
  promoReelOpened: {
    current: MovieEventAnalytics[],
    past: MovieEventAnalytics[]
  }
}
