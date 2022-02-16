import { Firestore } from '../types';
import { BigQuery } from '@google-cloud/bigquery';
import { createTitleMeta } from '@blockframes/analytics/+state/analytics.model';
import { Analytics } from '@blockframes/analytics/+state/analytics.firestore';
import { createDocumentMeta } from '@blockframes/utils/models-meta';
import { getCollection } from '../firebase-utils';
import { MovieAnalytics, MovieDocument } from '@blockframes/movie/+state/movie.firestore';
import { getCollectionInBatches } from '../util';
import { bigQueryAnalyticsTable, bigQueryFirestoreExportTable } from '@env';

const events_query = `
  SELECT *
  FROM (
    SELECT 
      ga.createdAt,
      ga.name,
      ga.titleId,
      ga.userId,
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
        MAX(if(params.key = "uid", params.value.string_value, NULL)) as userId,
        MAX(if(params.key = "page_location", params.value.string_value, NULL)) as page_location
      FROM \`${bigQueryAnalyticsTable}*\`,
      UNNEST(event_params) AS params
      WHERE event_name IN ('addedToWishlist', 'promoReelOpened', 'screeningRequested', 'askingPriceRequested')
      GROUP BY user_pseudo_id, event_timestamp
    ) as ga
    LEFT JOIN \`${bigQueryFirestoreExportTable}.users\` AS users
    ON GA.userId = users.uid
    WHERE users.email NOT LIKE '%concierge%'
  )
  WHERE name IS NOT NULL
    AND createdAt IS NOT NULL
    AND createdFrom IS NOT NULL
    AND userId IS NOT NULL
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
      userId,
      REGEXP_EXTRACT(MAX(page_path), '(?:.*)?/title/([^/]+)/(?:r/i/)?main') as titleId,
      MAX(users.orgId) as orgId
    FROM (
      SELECT 
        event_timestamp as createdAt,
        DATE(TIMESTAMP_MICROS(event_timestamp)) as day,
        MAX(event_name) as name,
        MAX(if(params.key = "uid", params.value.string_value, NULL)) as userId,
        MAX(if(params.key = "page_location", params.value.string_value, NULL)) as page_location,
        MAX(if(params.key = "page_title", params.value.string_value, NULL)) as page_title,
        MAX(if(params.key = "page_path", params.value.string_value, NULL)) as page_path
      FROM \`${bigQueryAnalyticsTable}*\`,
      UNNEST(event_params) AS params
      WHERE event_name = 'pageView'
      GROUP BY user_pseudo_id, event_timestamp
    ) as GA
    LEFT JOIN \`${bigQueryFirestoreExportTable}.users\` AS users
    ON GA.userId = users.uid
    WHERE page_path LIKE '%marketplace/title%'
      AND page_path LIKE '%main%'
      AND (
        LOWER(page_title) LIKE '%archipel market%'
        OR LOWER(page_title) LIKE '%archipel content%'
        OR LOWER(page_title) NOT LIKE '%media financiers%'
      )
      AND users.email NOT LIKE '%concierge%'
    GROUP BY day, userId
  )
  WHERE name IS NOT NULL
    AND createdAt IS NOT NULL
    AND createdFrom IS NOT NULL
    AND userId IS NOT NULL
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

  if (!bigQueryFirestoreExportTable || !bigQueryAnalyticsTable) {
    // BigQuery is not set up in project so nothing to import'
    return;
  }

 // query bigquery and create new analytics collection
  const [[pageViews], [otherEvents], titles] = await Promise.all([
    executeQuery(page_view_query),
    executeQuery(events_query),
    getCollection<MovieDocument>(`movies`)
  ]);
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
        userId: row.userId,
        ownerOrgIds: title.orgIds
      })
    };
    return event;

  }).filter(row => !!row);

  let i = 1;
  let batch = db.batch();
  while(i <= events.length) {
    const ref = db.collection(`analytics`).doc();
    const event: Analytics = { ...events[i - 1], id: ref.id }; // adding doc id

    batch.create(ref, event);

    if (i === rows.length) {
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