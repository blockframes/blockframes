export const production = false;

// Firebase
// ========

export const appUrl = {
  content: 'https://catalog-blockframes-pl.web.app',
  market: 'https://festival-blockframes-pl.web.app',
  crm: 'https://crm-blockframes-pl.web.app',
  financiers: 'https://financiers-blockframes-pl.web.app',
};

const firebaseConfig = {
  databaseURL: "blockframes-pl-3.firebaseapp.com",

  apiKey: "AIzaSyAFDyt01SjD3xfNE7IfEf0l7Cc1v4uhA-0",
  authDomain: "blockframes-pl-3.firebaseapp.com",
  projectId: "blockframes-pl-3",
  storageBucket: "blockframes-pl-3.appspot.com",
  messagingSenderId: "268400665682",
  appId: "1:268400665682:web:cd03738bf0fb202b4fab8b",
  measurementId: "G-5JF32PH9BQ"
};

export const firebaseRegion = 'europe-west1';

export function firebase(app?: string) {
  return firebaseConfig
}

// Algolia
// =======

export const algolia = {
  appId: '8E9YO1I9HB',
  indexNameOrganizations: {
    festival: 'pl_festival_org',
    financiers: 'pl_financiers_org',
    catalog: 'pl_catalog_org'
  },
  indexNameMovies: {
    festival: 'pl_festival_movies',
    financiers: 'pl_financiers_movies',
    catalog: 'pl_catalog_movies',
  },
  indexNameUsers: 'pl_users',
};

// Emails
// =======

export const supportEmails = {
  default: 'pldespaigne@cascade8.com',
  catalog: 'pldespaigne+catalog@cascade8.com',
  festival: 'pldespaigne+festival@cascade8.com',
  financiers: 'pldespaigne+financiers@cascade8.com'
}

export const suffixE2ESupportEmail = 'pl';

export const mailchimp = {
  server: 'us20',
  listId: 'efaccd1d28'
};

// Yandex
// =======

export const yandex = {
  festival: 0,
  financiers: 0,
  catalog: 0
};

// Hotjar
// ========
export const hotjar = {
  festival: 0,
  financiers: 0,
  catalog: 0
}

// Intercom
// ========

export const intercomId = '';

// Sentry
// =======

export const sentryEnv = undefined;
export const sentryDsn = undefined;

// BigQuery
// ========

export const bigQueryAnalyticsTable = 'blockframes-bruce.analytics_194443494.events_';

// Archipel OrgIds
// ========

export const centralOrgId = {
  cascade8: 'jnbHKBP5YLvRQGcyQ8In',
  catalog: 'nBM8sy5EEAOtVBCX4nTJ',
};

// Import / Export parameters
// =======

export const backupBucket = 'pl-3-backups';
export const heavyChunkSize = 7;
export const chunkSize = 15;

// JwPlayer
// @see https://dashboard.jwplayer.com/p/M0ZSpeUV/media/YlSFNnkR
// ========

export const jwplayer = {
  propertyId: 'M0ZSpeUV',
  playerId: 'LVeBD5vf',
  testVideoId: 'YlSFNnkR'
}

// Airtable
// ========

export const airtable = {
  baseId: undefined, // set a value to enable synchronization
  dailyUpdate: false,
  tables: {
    users: 'tbldFhsO49l3LckbE',
    orgs: 'tbl7IlojwJqsHloaM',
    titles: 'tblU9bVq3ac7tN72A',
    events: 'tblhGy1KxVpHOjGFU',
    contracts: 'tblI1oYgp3TGwRbcA',
    buckets: 'tblhMlJNPpcBf0gxu',
    offers: 'tblyMK16kw5Hxe0qb',
    titleAnalytics: 'tblAqimYguv23LP0C',
    orgAnalytics: 'tblfhqm4e9mIh6kPI',
    searchAnalytics: 'tblZWvCxgINdipzys',
    movieAnalytics: 'tbllLWnh5LmgIuRCz'
  }
};