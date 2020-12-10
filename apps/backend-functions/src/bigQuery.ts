import { CallableContext } from "firebase-functions/lib/providers/https";
import { BigQuery } from '@google-cloud/bigquery';
import { MovieEventAnalytics, PublicUser, OrganizationDocument, MovieAnalytics, EventsAnalytics, EventAnalytics, ScreeningEventDocument, MovieDocument } from "./data/types";
import { getDocument } from './data/internals';
import { bigQueryAnalyticsTable } from "./environments/environment";
import { isAfter, isBefore, parse, subDays } from 'date-fns';
import { omit } from 'lodash';
import { db } from './internals/firebase';
import { orgName } from "@blockframes/organization/+state/organization.firestore";

const queryMovieAnalytics = `
  SELECT
    event_name as event_name,
    COUNT(*) as hits,
    event_date,
    value.string_value as movieId,
    REGEXP_EXTRACT(value.string_value, '.*/marketplace/([^/]+)/view/main') as movieIdPage
  FROM
    \`${bigQueryAnalyticsTable}*\`,
    UNNEST(event_params) AS params
  WHERE
    (
      (event_name = @pageView AND key = 'page_path' AND REGEXP_EXTRACT(value.string_value, '.*/marketplace/([^/]+)/view/main') in UNNEST(@movieIds))
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

/** Query to get analytics of the number of views for the festival app event sessions pages
 * for an array of eventId
 */
const queryEventAnalytics = `
SELECT
  event_name as event_name,
  COUNT(*) as hits,
  value.string_value as eventIdPage,
  user_id as userId,
  REGEXP_EXTRACT(value.string_value, '.*/marketplace/event/([^/]+)/session') as eventId
FROM
  \`${bigQueryAnalyticsTable}*\`,
  UNNEST(event_params) AS params
WHERE
    (
      event_name = @pageView
      AND key = 'page_path'
      AND REGEXP_EXTRACT(value.string_value, '.*/marketplace/event/([^/]+)/session') in UNNEST(@eventIds)
    )

GROUP BY
  event_name, event_date, eventId, eventIdPage, userId
ORDER BY
  event_name, event_date
`

const queryAnalyticsActiveUsers = `
  SELECT
    count(*) as page_view,
    user_id,
    TIMESTAMP_MICROS(MIN(event_timestamp)) as first_connexion,
    TIMESTAMP_MICROS(MAX(event_timestamp)) as last_connexion
  FROM
    \`${bigQueryAnalyticsTable}*\`,
    UNNEST(event_params) AS params
  WHERE event_name = 'pageView'
  AND user_id is not null
  GROUP BY user_id
  ORDER BY last_connexion DESC
  LIMIT 1000
`

async function executeQueryEventAnalytics(query: any, eventIds: string[]) {
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

async function executeQueryMovieAnalytics(query: any, movieIds: string[], daysPerRange: number) {
  const bigqueryClient = new BigQuery();

  const options = {
    query,
    timeoutMs: 100000,
    useLegacySql: false,
    params: {
      movieIds,
      pageView: 'pageView',
      promoReelOpened: 'promoReelOpened',
      addedToWishlist: 'addedToWishlist',
      periodSum: daysPerRange * 2
    }
  };

  return bigqueryClient.query(options);
}

async function executeQuery(query: any) {
  const bigqueryClient = new BigQuery();

  const options = {
    query,
    timeoutMs: 100000,
  };

  return bigqueryClient.query(options);
}

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

/** Sorts movie analytic events by movieId. */
const filterByMovieId = (events: MovieEventAnalytics[], movieId: string) => {
  return events.filter(event => event.movieId === movieId);
};

const findByUserId = (users: PublicUser[], userId: string) => {
  return users.find(user => user.uid === userId);
};

const findByOrgId = (orgs: OrganizationDocument[], orgId: string) => {
  return orgs.find(org => !!org && org.id === orgId);
};

/** Merge the movieIdPage field from bigquery with the movieId field when relevant. */
const mergeMovieIdPageInMovieId = (rows: any[]) => {
  // Remove the movieIdPage because it's a detail of implementation of the query to BigQuery.
  return rows.map(row => omit({ ...row, movieId: row.movieIdPage || row.movieId }, 'movieIdPage'));
};

const createEventAnalytics = (result: any, user: PublicUser | undefined, org: OrganizationDocument | undefined): EventAnalytics => {
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

/** Call bigQuery with an array of eventId to tet their analytics. */
export const requestEventAnalytics = async (
  data: { eventIds: string[] },
  context: CallableContext
): Promise<EventsAnalytics[]> => {
  const eventIds = data.eventIds;
  if (!eventIds) {
    return [];
  }
  const uid = context.auth!.uid;
  const user = await getDocument<PublicUser>(`users/${uid}`);
  const org = await getDocument<OrganizationDocument>(`orgs/${user.orgId}`);

  // Security: only events with the same ownerId that orgId of user
  const screeningEventsPromises = eventIds.map(eventId => {
    return getDocument<ScreeningEventDocument>(`events/${eventId}`)
  });
  const screeningEvents = await Promise.all(screeningEventsPromises);
  const screeningEventsOwnerIds = screeningEvents.map(e => e.ownerId);
  if (!screeningEventsOwnerIds.every(ownerId => org.id === ownerId)) {
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

/** Call bigQuery with an array of movieId to get their analytics. */
export const requestMovieAnalytics = async (
  data: { movieIds: string[], daysPerRange: number },
  context: CallableContext
): Promise<MovieAnalytics[]> => {
  const { movieIds, daysPerRange } = data;
  if (!movieIds.length) {
    return [];
  }
  const uid = context.auth!.uid;
  const user = await getDocument<PublicUser>(`users/${uid}`);

  // Security: only owner of the movie can load the data
  if (movieIds.every(async movieId => {
    const movie = await getDocument<MovieDocument>(`movies/${movieId}`);
    return movie.orgIds.includes(user.orgId);
  })) {
    // Request bigQuery
    let [rows] = await executeQueryMovieAnalytics(queryMovieAnalytics, movieIds, daysPerRange);
    if (rows !== undefined && rows.length >= 0) {
      rows = mergeMovieIdPageInMovieId(rows);
      return movieIds.map(movieId => {
        const movieRows = filterByMovieId(rows, movieId);
        return {
          movieId,
          addedToWishlist: groupEventsPerDayRange(movieRows.filter(row => row.event_name === 'addedToWishlist'), daysPerRange),
          promoReelOpened: groupEventsPerDayRange(movieRows.filter(row => row.event_name === 'promoReelOpened'), daysPerRange),
          movieViews: groupEventsPerDayRange(movieRows.filter(row => row.event_name === 'pageView'), daysPerRange)
        }
      })
    } else {
      throw new Error('Unexepected error.');
    }
  } else {
    throw new Error(`Insufficient permission to get this movie's analytics.`);
  }
};

export const getAnalyticsActiveUsers = async (
  _: any,
  context: CallableContext
): Promise<any[]> => {

  if (!context?.auth) { throw new Error('Permission denied: missing auth context.'); }
  const admin = await db.doc(`blockframesAdmin/${context.auth.uid}`).get();
  if (!admin.exists) { throw new Error('Permission denied: you are not blockframes admin'); }

  const [rows] = await executeQuery(queryAnalyticsActiveUsers);

  if (rows !== undefined && rows.length >= 0) {
    console.log(rows);
    return rows;
  } else {
    throw new Error('Unexepected error.');
  }
};
