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
  apiKey: 'fake-key',
  authDomain: '',
  databaseURL: '',
  projectId: 'demo-blockframes',
  storageBucket: 'blockframes-ci',
  messagingSenderId: '',
  appId: 'fake-key',
  measurementId: ''
};

export const firebaseRegion = 'europe-west1';

export function firebase(app?: string) {
  return firebaseConfig
}

// Algolia
// =======
// ! CI ALGOLIA VALUES - needed for test runs
export const algolia = {
  appId: '8E9YO1I9HB',
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


// Emails
// =======

export const supportEmails = {
  default: 'dev+ci@blockframes.io', // redirect to => blockframes.dev@gmail.com
  catalog: 'dev+ci_catalog@blockframes.io',
  festival: 'dev+ci_festival@blockframes.io',
  financiers: 'dev+ci_financiers@blockframes.io'
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

export const sentryEnv = 'ci';
export const sentryDsn = 'https://a5f8a3139c754fa088453dbd710d9418@sentry.io/1540126';

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

export const backupBucket = 'blockframes-ci-anonymized-data';
export const heavyChunkSize = 25;
export const chunkSize = 50;

// JwPlayer
// @see https://dashboard.jwplayer.com/p/M0ZSpeUV/media/YlSFNnkR
// ========

export const jwplayer = {
  propertyId: 'M0ZSpeUV',
  playerId: 'LVeBD5vf',
  testVideoId: 'YlSFNnkR'
}
