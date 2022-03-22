export const production = true;

// Firebase
// ========

export const appUrl = {
  content: 'https://demo4.archipelcontent.com',
  market: 'https://demo4.archipelmarket.com',
  crm: 'https://demo4.crm.blockframes.io',
  financiers: 'https://blockframes-demo4-financiers.web.app',
}

const firebaseConfig = {
  apiKey: 'AIzaSyB8Ch4AX-SsVbl76goSlkfS9FHh6FkT5MY',
  authDomain: 'blockframes-demo-4.firebaseapp.com',
  databaseURL: 'https://blockframes-demo-4.firebaseio.com',
  projectId: 'blockframes-demo-4',
  storageBucket: 'blockframes-demo-4.appspot.com',
  messagingSenderId: '549985951125',
  appId: '1:549985951125:web:953361aebca213efd92a9c',
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
    festival: 'demo4_festival_org',
    financiers: 'demo4_financiers_org',
    catalog: 'demo4_catalog_org'
  },
  indexNameMovies: {
    festival: 'demo4_festival_movies',
    financiers: 'demo4_financiers_movies',
    catalog: 'demo4_catalog_movies',
  },
  indexNameUsers: 'demo4_users',
};

// Support emails
// =======

export const supportEmails = {
  default: 'dev+demo4@blockframes.io', // redirect to => blockframes.dev@gmail.com
  catalog: 'dev+demo4_catalog@blockframes.io',
  festival: 'dev+demo4_festival@blockframes.io',
  financiers: 'dev+demo4_financiers@blockframes.io'
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

export const sentryEnv = 'demo-4';
export const sentryDsn = 'https://a5f8a3139c754fa088453dbd710d9418@sentry.io/1540126';

// BigQuery
// ========

export const bigQueryAnalyticsTable = 'blockframes-demo-4.analytics_197180636.events_';

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

export const backupBucket = 'demo4-backups';
export const heavyChunkSize = 15;
export const chunkSize = 30;

// JwPlayer
// @see https://dashboard.jwplayer.com/#/content/detail?key=7R9ttesP&property=75507f12-83b6-11ea-ab11-3e60acbe08db&spotlight=default&tab=metadata&view=list
// ========

export const playerId = 'LVeBD5vf';
export const testVideoId = 'YlSFNnkR';
