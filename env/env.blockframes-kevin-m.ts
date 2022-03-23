export const production = false;

// Firebase
// ========

export const appUrl = {
  content: 'https://blockframes-kevin-m.web.app',
  market: 'https://festival-blockframes-kevin-m.web.app',
  crm: 'https://crm-blockframes-kevin-m.web.app',
  financiers: 'https://financiers-blockframes-kevin-m.web.app',
};

const firebaseConfig = {
  apiKey: "AIzaSyD8jsLjxwFdzc5ccMmZqJDYJsFZ9wWVQq8",
  authDomain: "blockframes-kevin-m.firebaseapp.com",
  databaseURL: "https://blockframes-kevin-m.firebaseio.com",
  projectId: "blockframes-kevin-m",
  storageBucket: "blockframes-kevin-m.appspot.com",
  messagingSenderId: "96110418071",
  appId: "1:96110418071:web:dc103a8d9593e03be1f1d2",
  measurementId: "G-RFB8TJ1821"
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
    festival: 'kevin_m_festival_org',
    financiers: 'kevin_m_financiers_org',
    catalog: 'kevin_m_catalog_org'
  },
  indexNameMovies: {
    festival: 'kevin_m_festival_movies',
    financiers: 'kevin_m_financiers_movies',
    catalog: 'kevin_m_catalog_movies',
  },
  indexNameUsers: 'kevin_m_users',
};

// Support emails
// =======

export const supportEmails = {
  default: 'kmarais@cascade8.com',
  catalog: 'kmarais+catalog@cascade8.com',
  festival: 'kmarais+festival@cascade8.com',
  financiers: 'kmarais+financiers@cascade8.com'
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

// Sentry
// =======

export const sentryEnv = undefined;
export const sentryDsn = undefined;

// BigQuery
// ========

export const bigQueryAnalyticsTable = 'blockframes-bruce.analytics_194443494.events_';

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

export const backupBucket = 'kevin-m-backups';
export const heavyChunkSize = 7;
export const chunkSize = 15;

// JwPlayer
// @see https://dashboard.jwplayer.com/#/content/detail?key=7R9ttesP&property=75507f12-83b6-11ea-ab11-3e60acbe08db&spotlight=default&tab=metadata&view=list
// ========

export const playerId = 'LVeBD5vf';
export const testVideoId = 'YlSFNnkR';
