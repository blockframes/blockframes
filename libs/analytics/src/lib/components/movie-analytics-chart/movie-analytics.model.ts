import { EventName } from "@blockframes/analytics/+state";

export interface MovieEventAnalytics {
  event_date: string,
  event_name: EventName,
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
