import { BigQuery, Query } from '@google-cloud/bigquery';
import * as admin from 'firebase-admin';
import { bigQueryAnalyticsTable } from "./../environments/environment";
import { MovieAnalytics, MovieEventAnalytics } from '@blockframes/movie/+state/movie.firestore';
import { isAfter, isBefore, parse, subDays } from 'date-fns';
import { getCollectionInBatches } from '@blockframes/firebase-utils';

const queryMovieAnalytics = `
  SELECT
    event_name,
    event_date,
    COUNT(*) AS hits,
    CASE
      WHEN event_name = 'pageView'
      THEN REGEXP_EXTRACT(value.string_value, '.*/marketplace/title/([^/]+)/main')
      ELSE value.string_value
    END AS movieId
  FROM
    \`${bigQueryAnalyticsTable}*\`,
    UNNEST(event_params) AS params
  WHERE
    (
      (event_name = 'pageView' AND key = 'page_path' AND REGEXP_EXTRACT(value.string_value, '.*/marketplace/title/([^/]+)/main') IS NOT NULL)
      OR
      (event_name = 'promoReelOpened' AND key = 'movieId')
      OR
      (event_name = 'addedToWishlist' AND key = 'movieId')
      OR
      (event_name = 'screeningRequested' AND key = 'movieId')
      OR
      (event_name = 'askingPriceRequested' AND key = 'movieId')
    )
    AND (
      DATE_DIFF(CURRENT_DATE(), PARSE_DATE('%Y%m%d', event_date), DAY) < @periodSum
    )
  GROUP BY
    event_name, event_date, movieId
  ORDER BY
    event_name, event_date
`

/** Sorts events into two periods. */
const groupEventsPerDayRange = (events: MovieEventAnalytics[], daysPerRange: number) => {
  const now = new Date();
  const startCurrentRange = subDays(now, daysPerRange);
  const parseDate = (event: MovieEventAnalytics) => parse(event.event_date, 'yyyyMMdd', new Date());
  return {
    current: events.filter(event => isAfter(parseDate(event), startCurrentRange)),
    past: events.filter(event => isBefore(parseDate(event), startCurrentRange))
  };
};

async function executeQueryMovieAnalytics(daysPerRange: number): Promise<MovieEventAnalytics[][]> {
  const bigQueryClient = new BigQuery();

  const query: Query = {
    query: queryMovieAnalytics,
    timeoutMs: 100000,
    useLegacySql: false,
    params: {
      periodSum: daysPerRange * 2
    }
  };

  const analytics = await bigQueryClient.query(query) as MovieEventAnalytics[][];
  return analytics;
}

/**
 *
 */
export async function importAnalytics() {
  const db = admin.firestore();
  const deleteBatch = db.batch();
  const setBatch = db.batch();
  const daysPerRange = 28;

  const [rows] = await executeQueryMovieAnalytics(daysPerRange);

  const movieAnalytics: Record<string, MovieAnalytics> = {}
  rows.forEach(row => {
    if (!movieAnalytics[row.movieId]) {

      const movieRows = rows.filter(r => r.movieId === row.movieId)
      movieAnalytics[row.movieId] = {
        id: row.movieId,
        type: 'movie',
        addedToWishlist: groupEventsPerDayRange(movieRows.filter(r => r.event_name === 'addedToWishlist'), daysPerRange),
        promoReelOpened: groupEventsPerDayRange(movieRows.filter(r => r.event_name === 'promoReelOpened'), daysPerRange),
        movieViews: groupEventsPerDayRange(movieRows.filter(r => r.event_name === 'pageView'), daysPerRange)
      }
    }
  });

  const analyticsIterator = getCollectionInBatches<MovieAnalytics>(db.collection('analytics'), 'type')
  for await (const analytics of analyticsIterator) {
    for (const analytic of analytics) {
      const ref = db.doc(`analytics/${analytic.id}`)
      deleteBatch.delete(ref);
    }
  }
  await deleteBatch.commit();

  for (const id in movieAnalytics) {
    const ref = db.doc(`analytics/${id}`);
    setBatch.set(ref, movieAnalytics[id]);
  }
  await setBatch.commit();
}
