export const production = false;

// Firebase
// ========

export const appUrl = {
  content: 'https://catalog-blockframes-vincent.web.app',
  market: 'https://festival-blockframes-vincent.web.app',
  crm: 'https://crm-blockframes-vincent.web.app',
  financiers: 'https://financiers-blockframes-vincent.web.app',
};

const firebaseConfig = {
  apiKey: "AIzaSyCA7YvLVF4GUScjaWk4hah3LvByAdL_Z5k",
  authDomain: "blockframes-vincent.firebaseapp.com",
  databaseURL: "https://blockframes-vincent.firebaseio.com",
  projectId: "blockframes-vincent",
  storageBucket: "blockframes-vincent.appspot.com",
  messagingSenderId: "87423685971",
  appId: "1:87423685971:web:154b9dbb018971ea",
  measurementId: "G-XL5ENVWL8Z"
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
    festival: 'vincent_festival_org',
    financiers: 'vincent_financiers_org',
    catalog: 'vincent_catalog_org',
  },
  indexNameMovies: {
    festival: 'vincent_festival_movies',
    financiers: 'vincent_financiers_movies',
    catalog: 'vincent_catalog_movies',
  },
  indexNameUsers: 'vincent_users',
};

// Support emails
// =======

export const supportEmails = {
  default: 'vchoukroun@cascade8.com',
  catalog: 'vchoukroun+catalog@cascade8.com',
  festival: 'vchoukroun+festival@cascade8.com',
  financiers: 'vchoukroun+financiers@cascade8.com'
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

export const sentryEnv = '';
export const sentryDsn = '';

// BigQuery
// ========

export const bigQueryAnalyticsTable = 'blockframes-vincent.analytics_194475739.events_';

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

export const backupBucket = 'vincent-backups';
export const heavyChunkSize = 10;
export const chunkSize = 25;

// JwPlayer
// @see https://dashboard.jwplayer.com/#/content/detail?key=7R9ttesP&property=75507f12-83b6-11ea-ab11-3e60acbe08db&spotlight=default&tab=metadata&view=list
// ========

export const playerId = 'LVeBD5vf';
export const testVideoId = 'YlSFNnkR';
