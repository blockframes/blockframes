export const production = false;

// Firebase
// ========

export const appUrl = {
  content: 'https://catalog-blockframes-demo.web.app',
  market: 'https://festival-blockframes-demo.web.app',
  crm: 'https://crm-blockframes-demo.web.app',
  financiers: 'https://financiers-blockframes-demo.web.app',
  waterfall: 'https://waterfall-blockframes-demo-1.web.app',
};

const firebaseConfig = {
  apiKey: "AIzaSyDSzSkRCmbCDLKWFMCOCqxe110RhjIs9ck",
  authDomain: "blockframes-vincent-2.firebaseapp.com",
  databaseURL: "blockframes-vincent-2.firebaseapp.com",
  projectId: "blockframes-vincent-2",
  storageBucket: "blockframes-vincent-2.appspot.com",
  messagingSenderId: "302621021889",
  appId: "1:302621021889:web:44db483d2adbae81ca6640",
  measurementId: "G-K4XCX15P9P"
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
    festival: 'vincent_festival_org',
    financiers: 'vincent_financiers_org',
    catalog: 'vincent_catalog_org',
    waterfall: 'vincent_waterfall_org'
  },
  indexNameMovies: {
    festival: 'vincent_festival_movies',
    financiers: 'vincent_financiers_movies',
    catalog: 'vincent_catalog_movies'
  },
  indexNameUsers: 'vincent_users',
};

// Emails
// =======

export const supportEmails = {
  default: 'vchoukroun@cascade8.com',
  catalog: 'vchoukroun+catalog@cascade8.com',
  festival: 'vchoukroun+festival@cascade8.com',
  financiers: 'vchoukroun+financiers@cascade8.com',
  waterfall: 'vchoukroun+waterfall@cascade8.com'
}

export const mailchimp = {
  server: 'us20',
  listId: 'efaccd1d28'
};

// Yandex
// =======

export const yandex = {
  festival: 0,
  financiers: 0,
  catalog: 0,
  waterfall: 0
};

// Hotjar
// ========
export const hotjar = {
  festival: 0,
  financiers: 0,
  catalog: 0,
  waterfall: 0
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

export const bigQueryAnalyticsTable = '';

// Archipel OrgIds
// ========

export const centralOrgId = {
  cascade8: 'jnbHKBP5YLvRQGcyQ8In',
  catalog: 'nBM8sy5EEAOtVBCX4nTJ',
};

// Import / Export parameters
// =======

export const backupBucket = 'vincent-backups';
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
