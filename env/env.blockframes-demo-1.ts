export const production = true;

// Firebase
// ========

export const appUrl = {
  content: 'https://blockframes-demo-1.web.app',
  market: 'https://festival-demo1-blockframes.web.app',
  crm: 'https://crm-demo1-blockframes.web.app',
  financiers: 'https://blockframes-demo1-financiers.web.app',
};

const firebaseConfig = {
  apiKey: "AIzaSyBu86_wOPRjXyR-wVXq4FLkQ0GZrcgWTsM",
  authDomain: "blockframes-demo-1.firebaseapp.com",
  databaseURL: "https://blockframes-demo-1.firebaseio.com",
  projectId: "blockframes-demo-1",
  storageBucket: "blockframes-demo-1.appspot.com",
  messagingSenderId: "11685432883",
  appId: "1:11685432883:web:bedc809872148fcde49d46",
  measurementId: "G-ZQHCHN67GF"
};

export const firebaseRegion = 'europe-west1';

// Enable or disable emulators parts
// and run "npm run firebase:emulator"
// @see https://www.notion.so/cascade8/Emulator-79492738d2614b35b6435eb80584ff26
export const emulators = {
  auth: false,
  firestore: false,
  functions: false
};

export function firebase(app?: string) {
  return firebaseConfig
}

// Algolia
// =======

export const algolia = {
  appId: '8E9YO1I9HB',
  searchKey: '4a2990a293c0ee0bfde9ebd66270a47f',
  indexNameOrganizations: {
    festival: 'demo1_festival_org',
    financiers: 'demo1_financiers_org',
    catalog: 'demo1_catalog_org'
  },
  indexNameMovies: {
    festival: 'demo1_festival_movies',
    financiers: 'demo1_financiers_movies',
    catalog: 'demo1_catalog_movies',
  },
  indexNameUsers: 'demo1_users',
};

// Support emails
// =======

export const supportEmails = {
  default: 'dev+demo1@blockframes.io', // redirect to => blockframes.dev@gmail.com
  catalog: 'dev+demo1_catalog@blockframes.io',
  festival: 'dev+demo1_festival@blockframes.io',
  financiers: 'dev+demo1_financiers@blockframes.io'
}

// Yandex
// =======

export const yandex = {
  festival: 0,
  financiers: 0,
  catalog: 0
};

// Intercom
// ========

export const intercomId = 'srwfltp4';

// OMDB
// =======

export const omdbApiKey = '4d1be897';

// Sentry
// =======

export const sentryEnv = 'demo-1';
export const sentryDsn = 'https://a5f8a3139c754fa088453dbd710d9418@sentry.io/1540126';

// BigQuery
// ========

export const bigQueryAnalyticsTable = 'blockframes-demo1.analytics_200039147.events_';

// Data Studio
// ========

export const datastudio = {
  user: ''
}

// Archipel OrgIds
// ========

export const centralOrgId = {
  cascade8: 'jnbHKBP5YLvRQGcyQ8In',
  catalog: 'nBM8sy5EEAOtVBCX4nTJ',
};

// Import / Export parameters
// =======

export const backupBucket = 'blockframes-demo-1-db-backups';
export const heavyChunkSize = 15;
export const chunkSize = 30;

// JwPlayer
// @see https://dashboard.jwplayer.com/#/content/detail?key=7R9ttesP&property=75507f12-83b6-11ea-ab11-3e60acbe08db&spotlight=default&tab=metadata&view=list
// ========

export const playerId = 'LVeBD5vf';
export const testVideoId = 'YlSFNnkR';
