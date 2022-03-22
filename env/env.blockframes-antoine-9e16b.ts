export const production = false;

// Firebase
// ========

export const appUrl = {
  content: 'https://catalog-blockframes-antoine.web.app',
  market: 'https://festival-blockframes-antoine.web.app',
  crm: 'https://crm-blockframes-antoine.web.app',
  financiers: 'https://financiers-blockframes-antoine.web.app',
};

const firebaseConfig = {
  apiKey: 'AIzaSyAbWVBOK3olNWQ0IpRTyV_7VaEPJ5w1aKk',
  authDomain: 'blockframes-antoine-9e16b.firebaseapp.com',
  databaseURL: 'https://blockframes-antoine.firebaseio.com',
  projectId: 'blockframes-antoine-9e16b',
  storageBucket: 'blockframes-antoine-9e16b.appspot.com',
  messagingSenderId: '892119097462',
  appId: "1:892119097462:web:9ac42eb6f9d97f2126bf57",
  measurementId: "G-XXXXXXXXXX"
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
    festival: 'antoine_festival_org',
    financiers: 'antoine_financiers_org',
    catalog: 'antoine_catalog_org'
  },
  indexNameMovies: {
    festival: 'antoine_festival_movies',
    financiers: 'antoine_financiers_movies',
    catalog: 'antoine_catalog_movies',
  },
  indexNameUsers: 'antoine_users',
};

// Support emails
// =======

export const supportEmails = {
  default: 'apoppe@cascade8.com', // redirect to => blockframes.dev@gmail.com
  catalog: 'apoppe+catalog@cascade8.com',
  festival: 'apoppe+festival@cascade8.com',
  financiers: 'apoppe+financiers@cascade8.com'
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

export const sentryEnv = undefined;
export const sentryDsn = undefined;

// BigQuery  / Data Studio
// ========

export const bigQueryAnalyticsTable = 'blockframes-staging.analytics_194475853.events_';

// Data Studio
// ========

export const datastudio = {
  user: '',
  users: '',
  events: ''
}


// Archipel OrgIds
// ========

export const centralOrgId = {
  cascade8: 'jnbHKBP5YLvRQGcyQ8In',
  catalog: 'nBM8sy5EEAOtVBCX4nTJ',
};

// Import / Export parameters
// =======

export const backupBucket = 'blockframes-antoine-backup';
export const heavyChunkSize = 15;
export const chunkSize = 30;

// JwPlayer
// @see https://dashboard.jwplayer.com/#/content/detail?key=7R9ttesP&property=75507f12-83b6-11ea-ab11-3e60acbe08db&spotlight=default&tab=metadata&view=list
// ========

export const playerId = 'LVeBD5vf';
export const testVideoId = 'YlSFNnkR';
