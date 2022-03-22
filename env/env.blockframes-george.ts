export const production = false;

// Firebase
// ========

export const appUrl = {
  content: 'https://blockframes-george.web.app',
  market: 'https://blockframes-george-festival.web.app',
  financiers: 'https://blockframes-george-financiers.web.app',
  crm: 'https://blockframes-george-crm.web.app',
};

const firebaseConfig = {
  apiKey: 'AIzaSyBKe0IWd_NQql1cHmcnMJP58ZiTvZyikO0',
  authDomain: 'blockframes-george.firebaseapp.com',
  databaseURL: 'https://blockframes-george.firebaseio.com',
  projectId: 'blockframes-george',
  storageBucket: 'blockframes-george.appspot.com',
  messagingSenderId: '782756549621',
  appId: '1:782756549621:web:e3ae8b3914fd8acc3546bc',
  measurementId: 'G-1ERX03HP3B',
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
    festival: 'george_festival_org',
    financiers: 'george_financiers_org',
    catalog: 'george_catalog_org'
  },
  indexNameMovies: {
    festival: 'george_festival_movies',
    financiers: 'george_financiers_movies',
    catalog: 'george_catalog_movies',
  },
  indexNameUsers: 'george_users',
};

// Support emails
// =======

export const supportEmails = {
  default: 'ggrigorian@cascade8.com',
  catalog: 'ggrigorian+catalog@cascade8.com',
  festival: 'ggrigorian+festival@cascade8.com',
  financiers: 'ggrigorian+financiers@cascade8.com'
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

export const intercomId = '';

// OMDB
// =======

export const omdbApiKey = '4d1be897';

// Sentry
// =======

export const sentryEnv = undefined;
export const sentryDsn = undefined;

// BigQuery
// ========

export const bigQueryAnalyticsTable = 'blockframes-george.analytics_235781207.events_';

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

export const backupBucket = 'blockframes-george-backup';
export const heavyChunkSize = 10;
export const chunkSize = 25;

// JwPlayer
// @see https://dashboard.jwplayer.com/#/content/detail?key=7R9ttesP&property=75507f12-83b6-11ea-ab11-3e60acbe08db&spotlight=default&tab=metadata&view=list
// ========

export const playerId = 'LVeBD5vf';
export const testVideoId = 'YlSFNnkR';
