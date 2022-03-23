export const production = false;

// Firebase
// ========

export const appUrl = {
  content: 'https://blockframes-kevin-d.web.app',
  market: 'https://festival-blockframes-kevin-d.web.app',
  crm: 'https://crm-blockframes-kevin-d.web.app',
  financiers: 'https://financiers-blockframes-kevin-d.web.app',
};

const firebaseConfig = {
  apiKey: "AIzaSyAm7vb6x5rZNguI1ihFq8POu6hH7ONpz8Y",
  authDomain: "blockframes-kevin-d.firebaseapp.com",
  databaseURL: "https://blockframes-kevin-d.firebaseio.com",
  projectId: "blockframes-kevin-d",
  storageBucket: "blockframes-kevin-d.appspot.com",
  messagingSenderId: "318751875226",
  appId: "1:318751875226:web:81880b2e5fb9828c3dbf23",
  measurementId: "G-6EWD5MHVBD"
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
    festival: 'kevin_d_festival_org',
    financiers: 'kevin_d_financiers_org',
    catalog: 'kevin_d_catalog_org'
  },
  indexNameMovies: {
    festival: 'kevin_d_festival_movies',
    financiers: 'kevin_d_financiers_movies',
    catalog: 'kevin_d_catalog_movies',
  },
  indexNameUsers: 'kevin_d_users',
};

// Support emails
// =======

export const supportEmails = {
  default: 'kdurand@cascade8.com',
  catalog: 'kdurand+catalog@cascade8.com',
  festival: 'kdurand+festival@cascade8.com',
  financiers: 'kdurand+financiers@cascade8.com'
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


// OMDB
// =======

export const omdbApiKey = '4d1be897';

// Sentry
// =======

export const sentryEnv = undefined;
export const sentryDsn = undefined;

// Quorum
// ========

export const quorum = {
  archipelNode: {
    url: 'https://e0rf4hbql8-e0cy67u40h-rpc.de0-aws.kaleido.io',
    user: 'e0xwcvgknw',
    privateFor: 'PJg4NoFMk73mGCbkJ7/griaiKfkbS+edhfjO5PzztQs=',
    ethAddress: '0x7E5D163D7390A6068d44C8e2F3c2861B5133daa4',
  },
  pulsarlNode: {
    url: 'https://e0rf4hbql8-e0zhtusyfh-rpc.de0-aws.kaleido.io',
    user: 'e0xwcvgknw',
    privateFor: 'fnF4IPKvDcmM9bgmEKHoYjNyXG6cXqJjv806RK1F5y8=',
    ethAddress: '0x43c92D51ba8c0B83062F8116B036D6616ebe4746',
  },
  bankNode: {
    url: 'https://e0rf4hbql8-e0jbt507aa-rpc.de0-aws.kaleido.io',
    user: 'e0xwcvgknw',
    privateFor: 'Tj879+7P6IgX2UJTOLtWx5IjrPlABb7HO//kNNbnt28=',
    ethAddress: '0xe795245444d459CD0d8e12A26232646B5521e72F',
  },
}

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

export const backupBucket = 'kevin-d-backups';
export const heavyChunkSize = 7;
export const chunkSize = 15;

// JwPlayer
// @see https://dashboard.jwplayer.com/#/content/detail?key=7R9ttesP&property=75507f12-83b6-11ea-ab11-3e60acbe08db&spotlight=default&tab=metadata&view=list
// ========

export const playerId = 'LVeBD5vf';
export const testVideoId = 'YlSFNnkR';
