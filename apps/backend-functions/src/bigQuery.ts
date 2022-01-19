import { CallableContext } from "firebase-functions/lib/providers/https";
import { BigQuery } from '@google-cloud/bigquery';
import { bigQueryAnalyticsTable } from "./environments/environment";
import { db } from './internals/firebase';

/** Query to get analytics of the number of views for the festival app event sessions pages
 * for an array of eventId
 * #7570 Kept for the record, if need in future 
const queryEventAnalytics = `
SELECT
  event_name as event_name,
  COUNT(*) as hits,
  value.string_value as eventIdPage,
  user_id as userId,
  REGEXP_EXTRACT(value.string_value, '(?:.*)?/event/([^/]+)/(?:r/i/)?session') as eventId
FROM
  \`${bigQueryAnalyticsTable}*\`,
  UNNEST(event_params) AS params
WHERE
    (
      event_name = @pageView
      AND key = 'page_path'
      AND REGEXP_EXTRACT(value.string_value, '(?:.*)?/event/([^/]+)/(?:r/i/)?session') in UNNEST(@eventIds)
    )

GROUP BY
  event_name, eventId, eventIdPage, userId
ORDER BY
  event_name
`
 */

const queryAnalyticsActiveUsers = `
  SELECT
    count(*) as page_view,
    user_id,
    (SELECT count(distinct(params.value.int_value)) as session_count FROM \`${bigQueryAnalyticsTable}*\`, UNNEST(event_params) AS params WHERE user_id = main.user_id  AND params.key = 'ga_session_id') AS session_count,
    TIMESTAMP_MICROS(MIN(event_timestamp)) as first_connexion,
    TIMESTAMP_MICROS(MAX(event_timestamp)) as last_connexion
  FROM
    \`${bigQueryAnalyticsTable}*\` as main,
    UNNEST(event_params) AS params
  WHERE event_name = 'pageView'
  AND user_id is not null
  GROUP BY user_id
  ORDER BY last_connexion DESC
  LIMIT 1000
`

async function executeQuery(query) {
  const bigqueryClient = new BigQuery();

  const options = {
    query,
    timeoutMs: 100000,
  };

  return bigqueryClient.query(options);
}

export const getAnalyticsActiveUsers = async (
  _,
  context: CallableContext
) => {

  if (!context?.auth) { throw new Error('Permission denied: missing auth context.'); }
  const admin = await db.doc(`blockframesAdmin/${context.auth.uid}`).get();
  if (!admin.exists) { throw new Error('Permission denied: you are not blockframes admin'); }

  const [rows] = await executeQuery(queryAnalyticsActiveUsers);

  if (rows !== undefined && rows.length >= 0) {
    return rows;
  } else {
    throw new Error('Unexepected error.');
  }
};
