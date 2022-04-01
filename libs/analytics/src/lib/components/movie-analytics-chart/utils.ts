import { Analytics, EventName } from '@blockframes/shared/model';
import { MovieAnalytics, MovieEventAnalytics } from '@blockframes/analytics/components/movie-analytics-chart/movie-analytics.model';

import { subDays, format } from 'date-fns'

export function toMovieAnalytics(analytics: Analytics<'title'>[]): MovieAnalytics[] {
  const today = new Date();
  const current = subDays(today, 28);
  const past = subDays(today, 56);
  
  const currentEvents = analytics.filter(event => event._meta.createdAt > current);
  const pastEvents = analytics.filter(event => event._meta.createdAt > past && event._meta.createdAt < current);

  const currentAnalytics = toMovieEventAnalytics(currentEvents);
  const pastAnalytics = toMovieEventAnalytics(pastEvents);

  const analyticsFilter = (name: string) => ({
    current: currentAnalytics.filter(analytics => analytics.event_name === name),
    past: pastAnalytics.filter(analytics => analytics.event_name === name)
  })

  const movieAnalytics: MovieAnalytics = {
    addedToWishlist: analyticsFilter('addedToWishlist'),
    movieViews: analyticsFilter('pageView'),
    promoReelOpened: analyticsFilter('promoReelOpened'),
    id: ''
  };

  return [movieAnalytics];
}

function toMovieEventAnalytics(events: Analytics<'title'>[]): MovieEventAnalytics[] {
  const counter: Record<EventName, Record<string, MovieEventAnalytics>> = {
    addedToWishlist: {},
    askingPriceRequested: {},
    pageView: {},
    promoReelOpened: {},
    removedFromWishlist: {},
    screeningRequested: {}
  };

  for (const event of events) {
    const date = format(event._meta.createdAt, 'yyyyMMdd');
    if (counter[event.name][date]) {
      counter[event.name][date].hits++;
      continue;
    }
    const movieEvent: MovieEventAnalytics = {
      event_date: date,
      event_name: event.name as EventName,
      hits: 1,
      movieId: event.meta.titleId
    };
    counter[event.name][date] = movieEvent;
  }

  return Object.values(counter).map(analytics => Object.values(analytics)).flat();
}