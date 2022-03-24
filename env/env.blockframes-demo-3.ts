export const production = true;

// Firebase
// ========

export const appUrl = {
  content: 'https://blockframes-demo-3.web.app',
  market: 'https://festival-demo3-blockframes.web.app',
  crm: 'https://crm-demo3-blockframes.web.app',
  financiers: 'https://blockframes-demo3-financiers.web.app',
}

const firebaseConfig = {
  apiKey: 'AIzaSyDuAWpaj0NVyMDWZURvl16IHsvJbVooXZ8',
  authDomain: 'blockframes-demo-3.firebaseapp.com',
  databaseURL: 'https://blockframes-demo-3.firebaseio.com',
  projectId: 'blockframes-demo-3',
  storageBucket: 'blockframes-demo-3.appspot.com',
  messagingSenderId: '39302449355',
  appId: '1:39302449355:web:4e9f252e5274664881f34e',
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
    festival: 'demo3_festival_org',
    financiers: 'demo3_financiers_org',
    catalog: 'demo3_catalog_org'
  },
  indexNameMovies: {
    festival: 'demo3_festival_movies',
    financiers: 'demo3_financiers_movies',
    catalog: 'demo3_catalog_movies',
  },
  indexNameUsers: 'demo3_users',
};

// Support emails
// =======

export const supportEmails = {
  default: 'dev+demo3@blockframes.io', // redirect to => blockframes.dev@gmail.com
  catalog: 'dev+demo3_catalog@blockframes.io',
  festival: 'dev+demo3_festival@blockframes.io',
  financiers: 'dev+demo3_financiers@blockframes.io'
}

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

export const intercomId = 'srwfltp4';

// Sentry
// =======

export const sentryEnv = 'demo-3';
export const sentryDsn = 'https://a5f8a3139c754fa088453dbd710d9418@sentry.io/1540126';

// BigQuery
// ========

export const bigQueryAnalyticsTable = 'blockframes-demo3.analytics_200039147.events_';

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

export const backupBucket = 'demo3-backups';
export const heavyChunkSize = 15;
export const chunkSize = 30;

// JwPlayer
// @see https://dashboard.jwplayer.com/#/content/detail?key=7R9ttesP&property=75507f12-83b6-11ea-ab11-3e60acbe08db&spotlight=default&tab=metadata&view=list
// ========

export const playerId = 'LVeBD5vf';
export const testVideoId = 'YlSFNnkR';
