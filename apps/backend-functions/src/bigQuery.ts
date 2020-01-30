import { CallableContext } from "firebase-functions/lib/providers/https";
import { BigQuery } from '@google-cloud/bigquery';
import { EventAnalytics, MovieAnalytics, PublicUser, OrganizationDocument } from "./data/types";
import { getDocument } from './data/internals';
import { AnalyticsEvents } from '@blockframes/utils/analytics/analyticsEvents';
import { bigQueryAnalyticsTable } from "./environments/environment";
import { isAfter, isBefore, parse, subDays } from 'date-fns';
import { omit } from 'lodash';

const queryMovieAnalytics = `
  SELECT
    event_name as event_name,
    COUNT(*) as hits,
    event_date,
    value.string_value as movieId,
    REGEXP_EXTRACT(value.string_value, '.*/marketplace/([^/]+)/view') as movieIdPage
  FROM
    \`${bigQueryAnalyticsTable}*\`,
    UNNEST(event_params) AS params
  WHERE
    (
      (event_name = @pageView AND key = 'page_path' AND REGEXP_EXTRACT(value.string_value, '.*/marketplace/([^/]+)/view') in UNNEST(@movieIds))
      OR
      (event_name = @promoReelOpened AND key = 'movieId' AND value.string_value in UNNEST(@movieIds))
      OR
      (event_name = @addedToWishlist AND key = 'movieId' and value.string_value in UNNEST(@movieIds))
    )
    AND (
      DATE_DIFF(CURRENT_DATE(), PARSE_DATE('%Y%m%d', event_date), DAY) < @periodSum
    )
  GROUP BY
    event_name, event_date, movieId, movieIdPage
  ORDER BY
    event_name, event_date
`

async function executeQuery(query: any, movieIds: string[], daysPerRange: number) {
  const bigqueryClient = new BigQuery();

  const options = {
    query,
    timeoutMs: 100000,
    useLegacySql: false,
    params: {
      movieIds,
      pageView: AnalyticsEvents.pageView,
      promoReelOpened: AnalyticsEvents.promoReelOpened,
      addedToWishlist: AnalyticsEvents.addedToWishlist,
      periodSum: daysPerRange * 2
    }
  };

  return bigqueryClient.query(options);
}

/** Sorts events into two periods. */
const aggregateEvents = (events: EventAnalytics[], daysPerRange: number) => {
  const now = new Date();
  const startCurrentRange = subDays(now, daysPerRange);
  const parseDate = (event: EventAnalytics)  => parse(event.event_date, 'yyyyMMdd', new Date());
  return {
    current: events.filter(event => isAfter(parseDate(event), startCurrentRange)),
    past: events.filter(event => isBefore(parseDate(event), startCurrentRange))
  };
};

/** Merge the movieIdPage field from bigquery with the movieId field when relevant. */
const mergeMovieIdPageInMovieId = (rows: any[]) => {
  return rows.map(row => omit({ ...row, movieId: row.movieIdPage || row.movieId }, 'movieIdPage'));
};

/** Call bigQuery with a movieId to get its analytics. */
export const requestMovieAnalytics = async (
  data: { movieIds: string[], daysPerRange: number },
  context: CallableContext
): Promise<MovieAnalytics> => {
  const { movieIds, daysPerRange } = data;
  const uid = context.auth!.uid;
  const user = await getDocument<PublicUser>(`users/${uid}`);
  const org = await getDocument<OrganizationDocument>(`orgs/${user.orgId}`);

  // Security: only owner of the movie can load the data
  if (movieIds.every(movieId => org.movieIds.includes(movieId))) {
    // Request bigQuery
    let [rows] = await executeQuery(queryMovieAnalytics, movieIds, daysPerRange);
    rows = mergeMovieIdPageInMovieId(rows);
    if (rows !== undefined && rows.length >= 0){
      return {
        addedToWishlist: aggregateEvents(rows.filter(row => row.event_name === AnalyticsEvents.addedToWishlist), daysPerRange),
        promoReelOpened: aggregateEvents(rows.filter(row => row.event_name === AnalyticsEvents.promoReelOpened), daysPerRange),
        movieViews: aggregateEvents(rows.filter(row => row.event_name === AnalyticsEvents.pageView), daysPerRange)
      };
    } else {
      throw new Error('Unexepected error.');
    }
  } else {
    throw new Error(`Insufficient permission to get this movie's analytics.`);
  }
};
