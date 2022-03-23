export const production = false;

// Firebase
// ========

export const appUrl = {
  content: 'https://catalog-blockframes-yonga.web.app',
  market: 'https://festival-blockframes-yonga.web.app',
  crm: 'https://crm-blockframes-yonga.web.app',
  financiers: 'https://financiers-blockframes-yonga.web.app',
};

const firebaseConfig = {
  apiKey: "AIzaSyBzGM-7NC57YLbASQkUSndv4VecQpvZQVU",
  authDomain: "blockframes-yonga.firebaseapp.com",
  projectId: "blockframes-yonga",
  storageBucket: "blockframes-yonga.appspot.com",
  messagingSenderId: "501013069726",
  appId: "1:501013069726:web:df084dbf4e4226aefba08f",
  measurementId: "G-V8YWVLYL52"
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
    catalog: 'yonga_catalog_orgs',
    festival: 'yonga_festival_orgs',
    financiers: 'yonga_financiers_orgs',
  },
  indexNameMovies: {
    catalog: 'yonga_catalog_movies',
    festival: 'yonga_festival_movies',
    financiers: 'yonga_financiers_movies',
  },
  indexNameUsers: 'yonga_users',
};

// Support emails
// =======

export const supportEmails = {
  default: 'yspringfield@cascade8.com',
  catalog: 'yspringfield+catalog@cascade8.com',
  festival: 'yspringfield+festival@cascade8.com',
  financiers: 'yspringfield+financiers@cascade8.com'
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

export const sentryEnv = undefined;
export const sentryDsn = undefined;

// BigQuery
// ========

export const bigQueryAnalyticsTable = 'blockframes-clelia.analytics_224526935.events_';

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

export const backupBucket = 'yonga-backups';
export const heavyChunkSize = 10;
export const chunkSize = 25;

// JwPlayer
// @see https://dashboard.jwplayer.com/#/content/detail?key=7R9ttesP&property=75507f12-83b6-11ea-ab11-3e60acbe08db&spotlight=default&tab=metadata&view=list
// ========

export const playerId = 'LVeBD5vf';
export const testVideoId = 'YlSFNnkR';
