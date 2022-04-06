export const production = false;

// Firebase
// ========

export const appUrl = {
  content: 'http://localhost:4200',
  market: 'http://localhost:4200',
  financiers: 'http://localhost:4200',
  crm: 'http://localhost:4200',
}

const firebaseConfig = {
  apiKey: '',
  authDomain: '',
  databaseURL: '',
  projectId: 'demo-blockframes',
  storageBucket: '',
  messagingSenderId: '',
  appId: '',
  measurementId: ''
};

export const firebaseRegion = 'europe-west1';

// Enable or disable emulators parts
// and run "npm run firebase:emulator"
// @see https://www.notion.so/cascade8/Emulator-79492738d2614b35b6435eb80584ff26
export const emulators = {
  auth: true,
  firestore: true,
  functions: true
};

export function firebase(app?: string) {
  return firebaseConfig
}

// Support emails
// =======

export const supportEmails = {
  default: 'dev+ci@blockframes.io', // redirect to => blockframes.dev@gmail.com
  catalog: 'dev+ci_catalog@blockframes.io',
  festival: 'dev+ci_festival@blockframes.io',
  financiers: 'dev+ci_financiers@blockframes.io'
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

export const intercomId = '';

// Sentry
// =======

export const sentryEnv = undefined;
export const sentryDsn = undefined;

// BigQuery
// ========


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

export const backupBucket = 'ci-backups-blockframes';
export const heavyChunkSize = 15;
export const chunkSize = 30;

// JwPlayer
// @see https://dashboard.jwplayer.com/#/content/detail?key=7R9ttesP&property=75507f12-83b6-11ea-ab11-3e60acbe08db&spotlight=default&tab=metadata&view=list
// ========

export const playerId = 'LVeBD5vf';
export const testVideoId = 'YlSFNnkR';

export const bigQueryAnalyticsTable = '';

// ! CI ALGOLIA VALUES - use this as a testing env? same for imgix, twilio, mailchimp...
export const algolia = {
  appId: '8E9YO1I9HB',
  searchKey: '4a2990a293c0ee0bfde9ebd66270a47f',
  indexNameOrganizations: {
    festival: 'ci_festival_org',
    financiers: 'ci_financiers_org',
    catalog: 'ci_catalog_org'
  },
  indexNameMovies: {
    festival: 'ci_festival_movies',
    financiers: 'ci_financiers_movies',
    catalog: 'ci_catalog_movies',
  },
  indexNameUsers: 'ci_users',
};
