import { Analytics } from "@blockframes/analytics/+state/analytics.firestore";
import { MovieAnalytics, MovieEventAnalytics } from "@blockframes/movie/+state/movie.firestore";
import { AnalyticsEvents } from "@blockframes/utils/analytics/analytics-model";
import { addDays } from 'date-fns'
import { toYMD } from "./movie-analytics-chart.component";

export function toMovieAnalytics(events: Analytics<'title'>[]): MovieAnalytics[] {
  const today = new Date();
  const current = addDays(today, -28);
  const past = addDays(today, -56);
  
  const currentEvents = events.filter(event => event._meta.createdAt > current);
  const pastEvents = events.filter(event => event._meta.createdAt > past && event._meta.createdAt < current);

  const currentAnalytics = toMovieEventAnalytics(currentEvents);
  const pastAnalytics = toMovieEventAnalytics(pastEvents);

  const movieAnalytics: MovieAnalytics = {
    addedToWishlist: {
      current: currentAnalytics.filter(analytics => analytics.event_name === 'addedToWishlist'),
      past: pastAnalytics.filter(analytics => analytics.event_name === 'addedToWishlist')
    },
    movieViews: {
      current: currentAnalytics.filter(analytics => analytics.event_name === 'pageView'),
      past: pastAnalytics.filter(analytics => analytics.event_name === 'pageView')
    },
    promoReelOpened: {
      current: currentAnalytics.filter(analytics => analytics.event_name === 'promoReelOpened'),
      past: pastAnalytics.filter(analytics => analytics.event_name === 'promoReelOpened')
    },
    type: 'movie',
    id: ''
  };

  return [movieAnalytics];
}

function toMovieEventAnalytics(events: Analytics<'title'>[]): MovieEventAnalytics[] {
  const counter: Record<AnalyticsEvents, Record<string, MovieEventAnalytics>> = {
    addedToWishlist: {},
    askingPriceRequested: {},
    pageView: {},
    promoReelOpened: {},
    removedFromWishlist: {},
    screeningRequested: {}
  };

  events.forEach(event => {
    const date = toYMD(event._meta.createdAt);
    if (counter[event.name][date]) {
      counter[event.name][date].hits++;
    } else {
      const movieEvent: MovieEventAnalytics = {
        event_date: date,
        event_name: event.name as AnalyticsEvents,
        hits: 1,
        movieId: event.meta.titleId
      };
      counter[event.name][date] = movieEvent;
    }
  });

  const eventAnalytics = [];
  for (const data of Object.values(counter)) {
    for (const analytics of Object.values(data)) {
      eventAnalytics.push(analytics);
    };
  };

  return eventAnalytics;
}