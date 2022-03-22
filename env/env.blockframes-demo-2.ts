export const production = true;

// Firebase
// ========

export const appUrl = {
  content: 'https://blockframes-demo-2.web.app',
  market: 'https://festival-demo2-blockframes.web.app',
  crm: 'https://crm-demo2-blockframes.web.app',
  financiers: 'https://blockframes-demo2-financiers.web.app',
}

const firebaseConfig = {
  apiKey: 'AIzaSyBmPF29hs2PPo4-4PjlR__ng-X14URyM7Q',
  authDomain: 'blockframes-demo-2.firebaseapp.com',
  databaseURL: 'https://blockframes-demo-2.firebaseio.com',
  projectId: 'blockframes-demo-2',
  storageBucket: 'blockframes-demo-2.appspot.com',
  messagingSenderId: '185137976939',
  appId: "1:185137976939:web:4ba213cad937f749b7432e",
  measurementId: 'G-XXXXXXXXXX' // @TODO #4214 measurementId: ""
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
    festival: 'demo2_festival_org',
    financiers: 'demo2_financiers_org',
    catalog: 'demo2_catalog_org'
  },
  indexNameMovies: {
    festival: 'demo2_festival_movies',
    financiers: 'demo2_financiers_movies',
    catalog: 'demo2_catalog_movies',
  },
  indexNameUsers: 'demo2_users',
};

// Support emails
// =======

export const supportEmails = {
  default: 'dev+demo2@blockframes.io', // redirect to => blockframes.dev@gmail.com
  catalog: 'dev+demo2_catalog@blockframes.io',
  festival: 'dev+demo2_festival@blockframes.io',
  financiers: 'dev+demo2_financiers@blockframes.io'
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

// Sentry
// =======

export const sentryEnv = 'demo-2';
export const sentryDsn = 'https://a5f8a3139c754fa088453dbd710d9418@sentry.io/1540126';

// BigQuery
// ========

export const bigQueryAnalyticsTable = 'blockframes-demo2.analytics_200039147.events_';

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

export const backupBucket = 'demo-2-backups-us';
export const heavyChunkSize = 15;
export const chunkSize = 30;

// JwPlayer
// @see https://dashboard.jwplayer.com/#/content/detail?key=7R9ttesP&property=75507f12-83b6-11ea-ab11-3e60acbe08db&spotlight=default&tab=metadata&view=list
// ========

export const playerId = 'LVeBD5vf';
export const testVideoId = 'YlSFNnkR';
