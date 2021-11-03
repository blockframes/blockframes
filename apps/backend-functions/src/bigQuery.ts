import { CallableContext } from "firebase-functions/lib/providers/https";
import { BigQuery } from '@google-cloud/bigquery';
import { PublicUser, OrganizationDocument, EventsAnalytics, EventAnalytics, ScreeningEventDocument } from "./data/types";
import { getDocument } from './data/internals';
import { bigQueryAnalyticsTable } from "./environments/environment";
import { db } from './internals/firebase';
import { orgName } from "@blockframes/organization/+state/organization.firestore";

/** Query to get analytics of the number of views for the festival app event sessions pages
 * for an array of eventId
 */
const queryEventAnalytics = `
SELECT
  event_name as event_name,
  COUNT(*) as hits,
  value.string_value as eventIdPage,
  user_id as userId,
  REGEXP_EXTRACT(value.string_value, '/event/([^/]+)/r/i/session') as eventId
FROM
  \`${bigQueryAnalyticsTable}*\`,
  UNNEST(event_params) AS params
WHERE
    (
      event_name = @pageView
      AND key = 'page_path'
      AND REGEXP_EXTRACT(value.string_value, '/event/([^/]+)/r/i/session') in UNNEST(@eventIds)
    )

GROUP BY
  event_name, eventId, eventIdPage, userId
ORDER BY
  event_name
`

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

async function executeQueryEventAnalytics(query, eventIds: string[]) {
  const bigqueryClient = new BigQuery();

  const options = {
    query,
    timeoutMs: 100000,
    useLegacySql: false,
    params: {
      eventIds,
      pageView: 'pageView'
    }
  };

  return bigqueryClient.query(options);
}

async function executeQuery(query) {
  const bigqueryClient = new BigQuery();

  const options = {
    query,
    timeoutMs: 100000,
  };

  return bigqueryClient.query(options);
}

const findByUserId = (users: PublicUser[], userId: string) => {
  return users.find(user => user.uid === userId);
};

const findByOrgId = (orgs: OrganizationDocument[], orgId: string) => {
  return orgs.find(org => !!org && org.id === orgId);
};

const createEventAnalytics = (result, user: PublicUser | undefined, org: OrganizationDocument | undefined): EventAnalytics => {
  return {
    ...result,
    email: user?.email,
    firstName: user?.firstName,
    lastName: user?.lastName,
    orgName: orgName(org),
    orgActivity: org?.activity,
    orgCountry: org?.addresses?.main.country,
  }
};

/** Call bigQuery with an array of eventId to get their analytics. */
export const requestEventAnalytics = async (
  data: { eventIds: string[] },
  context: CallableContext
): Promise<EventsAnalytics[]> => {
  const eventIds = data.eventIds;
  if (!eventIds) {
    return [];
  }
  const uid = context.auth.uid;
  const user = await getDocument<PublicUser>(`users/${uid}`);
  const org = await getDocument<OrganizationDocument>(`orgs/${user.orgId}`);

  // Security: only events with the same ownerOrgId that orgId of user
  const screeningEventsPromises = eventIds.map(eventId => {
    return getDocument<ScreeningEventDocument>(`events/${eventId}`)
  });
  const screeningEvents = await Promise.all(screeningEventsPromises);
  const screeningEventsOwnerOrgIds = screeningEvents.map(e => e.ownerOrgId);
  if (!screeningEventsOwnerOrgIds.every(ownerOrgId => org.id === ownerOrgId)) {
    throw new Error(`Insufficient permission to get events analytics.`)
  }

  // Request BigQuery
  let [rows] = await executeQueryEventAnalytics(queryEventAnalytics, eventIds);
  if (rows !== undefined && rows.length >= 0) {
    // Get all users to eliminate those who are part of the same org
    const eventsUsersPromises = rows.map(row => {
      return getDocument<PublicUser>(`users/${row.userId}`);
    });
    const eventsUsers = await Promise.all(eventsUsersPromises);
    const eventsUsersNotInOrg = eventsUsers.filter(u => !!u && !org.userIds.includes(u.uid));
    const userIdsNotInOrg = eventsUsersNotInOrg.map(u => u.uid);
    // Clean rows without users of the same org
    rows = rows.filter(row => userIdsNotInOrg.includes(row.userId));

    const orgsPromises = eventsUsersNotInOrg.filter(u => !!u.orgId).map(u => getDocument<OrganizationDocument>(`orgs/${u.orgId}`));
    const eventsOrgs = await Promise.all(orgsPromises);

    return eventIds.map(eventId => {
      const rowsEvents = rows.filter(row => row.eventId === eventId);
      const resultRows = rowsEvents.map(result => {
        const eventUser = findByUserId(eventsUsersNotInOrg, result.userId);
        const eventOrg = findByOrgId(eventsOrgs, eventUser.orgId);
        return createEventAnalytics(result, eventUser, eventOrg);
      });
      return {
        eventId,
        eventUsers: resultRows
      };
    });
  } else {
    throw new Error('Unexepected error.');
  }
};

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
