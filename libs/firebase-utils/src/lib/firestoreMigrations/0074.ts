import { Firestore } from '../types';
import { BigQuery } from '@google-cloud/bigquery';
import { Analytics, createTitleMeta } from '@blockframes/model';
import { createDocumentMeta } from '@blockframes/utils/models-meta';
import { getCollection } from '../firebase-utils';
import { MovieDocument } from '@blockframes/model';
import { MovieAnalytics } from '@blockframes/analytics/components/movie-analytics-chart/movie-analytics.model';
import { getCollectionInBatches } from '../util';
import { bigQueryAnalyticsTable, firebase } from '@env';

const events_query = `
  SELECT *
  FROM (
    SELECT
      ga.createdAt,
      ga.name,
      ga.titleId,
      ga.uid,
      CASE
          WHEN REGEXP_CONTAINS(ga.page_location, 'archipelmarket') THEN 'festival'
          WHEN REGEXP_CONTAINS(ga.page_location, 'archipelcontent') THEN 'catalog'
          WHEN REGEXP_CONTAINS(ga.page_location, 'mediafinanciers') THEN 'financiers'
      END as createdFrom,
      users.orgId
    FROM (
      SELECT
        event_timestamp as createdAt,
        MAX(event_name) as name,
        MAX(if(params.key = "movieId", params.value.string_value, NULL)) as titleId,
        MAX(if(params.key = "uid", params.value.string_value, NULL)) as uid,
        MAX(if(params.key = "page_location", params.value.string_value, NULL)) as page_location
      FROM \`${bigQueryAnalyticsTable}*\`,
      UNNEST(event_params) AS params
      WHERE event_name IN ('addedToWishlist', 'promoReelOpened', 'screeningRequested', 'askingPriceRequested')
      GROUP BY user_pseudo_id, event_timestamp
    ) as ga
    LEFT JOIN \`${firebase().projectId}.firestore_export.users\` AS users
    ON GA.uid = users.uid
    WHERE users.email NOT LIKE '%concierge%'
  )
  WHERE name IS NOT NULL
    AND createdAt IS NOT NULL
    AND createdFrom IS NOT NULL
    AND uid IS NOT NULL
    AND titleId IS NOT NULL
    AND orgId IS NOT NULL
`

const page_view_query = `
  SELECT *
  FROM (
    SELECT
      MAX(name) as name,
      MAX(createdAt) as createdAt,
      CASE
        WHEN REGEXP_CONTAINS(LOWER(MAX(page_title)), 'archipel market') THEN 'festival'
        WHEN REGEXP_CONTAINS(LOWER(MAX(page_title)), 'archipel content') THEN 'catalog'
        WHEN REGEXP_CONTAINS(LOWER(MAX(page_title)), 'media financiers') THEN 'financiers'
      END as createdFrom,
      users.uid,
      REGEXP_EXTRACT(MAX(page_path), '(?:.*)?/title/([^/]+)/(?:r/i/)?main') as titleId,
      MAX(users.orgId) as orgId
    FROM (
      SELECT
        event_timestamp as createdAt,
        DATE(TIMESTAMP_MICROS(event_timestamp)) as day,
        MAX(event_name) as name,
        MAX(if(params.key = "uid", params.value.string_value, NULL)) as uid,
        MAX(if(params.key = "page_location", params.value.string_value, NULL)) as page_location,
        MAX(if(params.key = "page_title", params.value.string_value, NULL)) as page_title,
        MAX(if(params.key = "page_path", params.value.string_value, NULL)) as page_path
      FROM \`${bigQueryAnalyticsTable}*\`,
      UNNEST(event_params) AS params
      WHERE event_name = 'pageView'
      GROUP BY user_pseudo_id, event_timestamp
    ) as GA
    LEFT JOIN \`${firebase().projectId}.firestore_export.users\` AS users
    ON GA.uid = users.uid
    WHERE page_path LIKE '%marketplace/title%'
      AND page_path LIKE '%main%'
      AND (
        LOWER(page_title) LIKE '%archipel market%'
        OR LOWER(page_title) LIKE '%archipel content%'
        OR LOWER(page_title) NOT LIKE '%media financiers%'
      )
      AND users.email NOT LIKE '%concierge%'
    GROUP BY day, users.uid
  )
  WHERE name IS NOT NULL
    AND createdAt IS NOT NULL
    AND createdFrom IS NOT NULL
    AND uid IS NOT NULL
    AND titleId IS NOT NULL
    AND orgId IS NOT NULL
`


/**
 * Import data from Google Analytics into Firestore
 * @param {Firestore} db
 * @returns
 */
export async function upgrade(db: Firestore) {
  // delete analytics collection
  const deleteBatch = db.batch();
  const analyticsIterator = getCollectionInBatches<MovieAnalytics>(db.collection('analytics'), 'type');
  for await (const analytics of analyticsIterator) {
    for (const analytic of analytics) {
      const ref = db.doc(`analytics/${analytic.id}`);
      deleteBatch.delete(ref);
    }
  }
  await deleteBatch.commit();

  if (!bigQueryAnalyticsTable) {
    // BigQuery is not set up in project so nothing to import'
    return;
  }

  // query bigquery and create new analytics collection
  const [[pageViews], [otherEvents], titles] = await Promise.all([
    executeQuery(page_view_query),
    executeQuery(events_query),
    getCollection<MovieDocument>(`movies`)
  ]).catch(error => {
    if (error.errors?.length) {
      if (error.errors.some(error => error.reason === 'notFound')) {
        return [[], []];
      }
    }
    throw new Error(error);
  });
  if (!pageViews && !otherEvents) {
    return;
  }
  const rows = pageViews.concat(otherEvents);

  const events = rows.map(row => {
    const title = titles.find(title => title.id === row.titleId);
    if (!title) return;

    const event: Analytics = {
      id: undefined, // id is added later
      name: row.name,
      type: 'title',
      _meta: createDocumentMeta({
        createdAt: new Date(row.createdAt / 1000),
        createdFrom: row.createdFrom,
      }),
      meta: createTitleMeta({
        orgId: row.orgId,
        titleId: row.titleId,
        uid: row.uid,
        ownerOrgIds: title.orgIds
      })
    };
    return event;

  }).filter(row => !!row);

  let i = 1;
  let batch = db.batch();
  while (i <= events.length) {
    const ref = db.collection(`analytics`).doc();
    const event: Analytics = { ...events[i - 1], id: ref.id }; // adding doc id

    batch.create(ref, event);

    if (i === events.length) {
      await batch.commit();
      break;
    } else if (i % 500 === 0) {
      // max size of batch is 500
      await batch.commit();
      batch = db.batch();
    }

    i++;
  }
}


async function executeQuery(query) {
  const bigqueryClient = new BigQuery();

  const options = {
    query,
    timeoutMs: 100000,
  };

  return bigqueryClient.query(options);
}
