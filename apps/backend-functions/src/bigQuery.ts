import { CallableContext } from "firebase-functions/lib/providers/https";
import { BigQuery } from '@google-cloud/bigquery';
import { PublicUser, OrganizationDocument, MovieAnalytics, EventAnalytics, CallMovieAnalytics } from "./data/types";
import { getDocument } from "./data/internals";

function queryAddedToWishlist(movieId: string, from: number, to: number) {
  return `
  SELECT params.value.string_value AS movieId, COUNT(*) AS hits
  FROM
    \`blockframes-hugo.analytics_195044791.events_*\`,
    UNNEST(event_params) AS params
  WHERE
    event_name = 'added_to_wishlist'
    AND _TABLE_SUFFIX BETWEEN FORMAT_DATE("%Y%m%d", DATE_SUB(CURRENT_DATE(), INTERVAL ${from} DAY)) AND FORMAT_DATE("%Y%m%d", DATE_SUB(CURRENT_DATE(), INTERVAL ${to} DAY))
    AND params.key = 'movieId'
    AND params.value.string_value = '${movieId}'
  GROUP BY
    movieId
  `
}

function queryPromoReelOpened(movieId: string, from: number, to: number) {
  return `
  SELECT params.value.string_value AS movieId, COUNT(*) AS hits
  FROM
    \`blockframes-hugo.analytics_195044791.events_*\`,
    UNNEST(event_params) AS params
  WHERE
    event_name = 'promo_reel_opened'
    AND _TABLE_SUFFIX BETWEEN FORMAT_DATE("%Y%m%d", DATE_SUB(CURRENT_DATE(), INTERVAL ${from} DAY)) AND FORMAT_DATE("%Y%m%d", DATE_SUB(CURRENT_DATE(), INTERVAL ${to} DAY))
    AND params.key = 'movieId'
    AND params.value.string_value = '${movieId}'
  GROUP BY
    movieId
  `
}

function queryMovieViews(movieId: string, from: number, to: number) {
  return `
  SELECT params.value.string_value AS page_path, COUNT(*) AS hits
  FROM
    \`blockframes-hugo.analytics_195044791.events_*\`,
    UNNEST(event_params) AS params
  WHERE
    event_name = 'page_view'
    AND _TABLE_SUFFIX BETWEEN FORMAT_DATE("%Y%m%d", DATE_SUB(CURRENT_DATE(), INTERVAL ${from} DAY)) AND FORMAT_DATE("%Y%m%d", DATE_SUB(CURRENT_DATE(), INTERVAL ${to} DAY))
    AND params.key = 'page_path'
    AND params.value.string_value = '/c/o/marketplace/${movieId}/view'
  GROUP BY
    page_path
  ORDER BY
    hits DESC
  `
}

async function executeQuery(query: any) {
  // Creates a client
  const bigqueryClient = new BigQuery();

  const options = {
    query,
    timeoutMs: 100000, // Time out after 100 seconds.
    useLegacySql: false,
  };

  // Runs the query
  return bigqueryClient.query(options);
}

function calculatePercentage(current: number, past: number) {
  return past ? (current / past - 1) * 100 : 0;
}

function calculateIncrease(current: EventAnalytics, past: EventAnalytics) {
  return past ? calculatePercentage(current.hits, past.hits) : 0;
}

/** Call bigQuery with a movieId to get its analytics. */
export const requestMovieAnalytics = async (
  data: CallMovieAnalytics,
  context: CallableContext
): Promise<MovieAnalytics> => {
  const { movieId, currentPeriod, pastPeriod } = data;
  const uid = context.auth!.uid;
  const user = await getDocument<PublicUser>(`users/${uid}`);
  const org = await getDocument<OrganizationDocument>(`orgs/${user.orgId}`);

  // Security: only owner of the movie can load the data
  if (org.movieIds.includes(movieId)) {
    // Request bigQuery
    const promises = [
      executeQuery(queryAddedToWishlist(movieId, currentPeriod.from, currentPeriod.to)),
      executeQuery(queryAddedToWishlist(movieId, pastPeriod.from, pastPeriod.to)),
      executeQuery(queryPromoReelOpened(movieId, currentPeriod.from, currentPeriod.to)),
      executeQuery(queryPromoReelOpened(movieId, pastPeriod.from, pastPeriod.to)),
      executeQuery(queryMovieViews(movieId, currentPeriod.from, currentPeriod.to)),
      executeQuery(queryMovieViews(movieId, pastPeriod.from, pastPeriod.to))
    ];
    const results = await Promise.all(promises);
    if (results !== undefined && results.length >= 0){
      return {
        addedToWishlist: { ...results[0][0][0], increase: calculateIncrease(results[0][0][0], results[1][0][0]) },
        promoReelOpened: { ...results[2][0][0], increase: calculateIncrease(results[2][0][0], results[3][0][0]) },
        movieViews: { ...results[4][0][0], increase: calculateIncrease(results[4][0][0], results[5][0][0]) }
      };
    } else {
      throw new Error('Unexepected error.');
    }
  } else {
    throw new Error(`Insufficient permission to get this movie's analytics.`);
  }
};
