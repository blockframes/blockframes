import { CallableContext } from "firebase-functions/lib/providers/https";
import { BigQuery } from '@google-cloud/bigquery';
import { EventAnalytics, MovieAnalytics, PublicUser, OrganizationDocument } from "./data/types";
import { getDocument } from './data/internals';
import { AnalyticsEvents } from '@blockframes/utils/analytics/analyticsEvents';
import { bigQueryAnalyticsTable } from "./environments/environment";
import { isAfter, isBefore, parse, subDays } from 'date-fns';

const queryMovieAnalytics = `
  SELECT
    event_name as event_name,
    COUNT(*) as hits,
    event_date
  FROM
    \`${bigQueryAnalyticsTable}*\`,
    UNNEST(event_params) AS params
  WHERE
    (
      (event_name = @pageView AND key = 'page_path' AND REGEXP_EXTRACT(value.string_value, '.*/marketplace/([^/]+)/view') = @movieId)
      OR
      (event_name = @promoReelOpened AND key = 'movieId' AND value.string_value = @movieId)
      OR
      (event_name = @addedToWishlist AND key = 'movieId' and value.string_value = @movieId)
    )
    AND (
      DATE_DIFF(CURRENT_DATE(), PARSE_DATE('%Y%m%d', event_date), DAY) < @periodSum
    )
  GROUP BY
    event_name, event_date
  ORDER BY
    event_name, event_date
`

async function executeQuery(query: any, movieId: string, rangeDays: number) {
  const bigqueryClient = new BigQuery();

  const options = {
    query,
    timeoutMs: 100000,
    useLegacySql: false,
    params: {
      movieId,
      pageView: AnalyticsEvents.pageView,
      promoReelOpened: AnalyticsEvents.promoReelOpened,
      addedToWishlist: AnalyticsEvents.addedToWishlist,
      periodSum: rangeDays * 2
    }
  };

  return bigqueryClient.query(options);
}

/** Sorts events into two periods. */
const aggregateEvents = (events: EventAnalytics[], days: number) => {
  const now = new Date();
  const startCurrentRange = subDays(now, days);
  const parseDate = (event: EventAnalytics)  => parse(event.event_date, 'yyyyMMdd', new Date());
  return {
    current: events.filter(event => isAfter(parseDate(event), startCurrentRange)),
    past: events.filter(event => isBefore(parseDate(event), startCurrentRange))
  };
};

/** Call bigQuery with a movieId to get its analytics. */
export const requestMovieAnalytics = async (
  data: { movieId: string, rangeDays: number },
  context: CallableContext
): Promise<MovieAnalytics> => {
  const { movieId, rangeDays } = data;
  const uid = context.auth!.uid;
  const user = await getDocument<PublicUser>(`users/${uid}`);
  const org = await getDocument<OrganizationDocument>(`orgs/${user.orgId}`);

  // Security: only owner of the movie can load the data
  if (org.movieIds.includes(movieId)) {
    // Request bigQuery
    const [rows] = await executeQuery(queryMovieAnalytics, movieId, rangeDays);
    if (rows !== undefined && rows.length >= 0){
      return {
        addedToWishlist: aggregateEvents(rows.filter(row => row.event_name === AnalyticsEvents.addedToWishlist), rangeDays),
        promoReelOpened: aggregateEvents(rows.filter(row => row.event_name === AnalyticsEvents.promoReelOpened), rangeDays),
        movieViews: aggregateEvents(rows.filter(row => row.event_name === AnalyticsEvents.pageView), rangeDays)
      };
    } else {
      throw new Error('Unexepected error.');
    }
  } else {
    throw new Error(`Insufficient permission to get this movie's analytics.`);
  }
};
