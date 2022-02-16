export const production = false;

export const persistenceSettings = {
  synchronizeTabs: true
};

// Firebase
// ========

export const appUrl = {
  content: 'https://blockframes-remco.web.app',
  market: 'http://blockframes-remco-festival.web.app',
  crm: 'https://blockframes-remco-crm.web.app',
  financiers: 'https://blockframes-remco-financiers.web.app'
};

const firebaseConfig = {
  apiKey: 'AIzaSyB1cJKPNsBDnq3qaK1VOUm2bNHuIJYthBY',
  authDomain: 'blockframes-remco.firebaseapp.com',
  databaseURL: 'https://blockframes-remco.firebaseio.com',
  projectId: 'blockframes-remco',
  storageBucket: 'blockframes-remco.appspot.com',
  messagingSenderId: '734521736086',
  appId: '1:734521736086:web:42cff622b99ae91a687bb7',
  measurementId: 'G-S2WM53H3YX'
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
    festival: 'remco_festival_orgs',
    financiers: 'remco_financiers_orgs',
    catalog: 'remco_catalog_orgs'
  },
  indexNameMovies: {
    festival: 'remco_festival_movies',
    financiers: 'remco_financiers_movies',
    catalog: 'remco_catalog_movies'
  },
  indexNameUsers: 'remco_users',
};

// Support emails
// =======

export const supportEmails = {
  default: 'rsimonides@cascade8.com',
  catalog: 'rsimonides+catalog@cascade8.com',
  festival: 'rsimonides+festival@cascade8.com',
  financiers: 'rsimonides+financiers@cascade8.com'
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

// Quorum
// ========

export const quorum = {
  archipelNode: {
    url: 'https://e0rf4hbql8-e0cy67u40h-rpc.de0-aws.kaleido.io',
    user: 'e0xwcvgknw',
    privateFor: 'PJg4NoFMk73mGCbkJ7/griaiKfkbS+edhfjO5PzztQs=',
    ethAddress: '0x7E5D163D7390A6068d44C8e2F3c2861B5133daa4'
  },
  pulsarlNode: {
    url: 'https://e0rf4hbql8-e0zhtusyfh-rpc.de0-aws.kaleido.io',
    user: 'e0xwcvgknw',
    privateFor: 'fnF4IPKvDcmM9bgmEKHoYjNyXG6cXqJjv806RK1F5y8=',
    ethAddress: '0x43c92D51ba8c0B83062F8116B036D6616ebe4746'
  },
  bankNode: {
    url: 'https://e0rf4hbql8-e0jbt507aa-rpc.de0-aws.kaleido.io',
    user: 'e0xwcvgknw',
    privateFor: 'Tj879+7P6IgX2UJTOLtWx5IjrPlABb7HO//kNNbnt28=',
    ethAddress: '0xe795245444d459CD0d8e12A26232646B5521e72F'
  },
}

// BigQuery
// ========
export const bigQueryAnalyticsTable = 'blockframes-remco.analytics_234801912.events_';

// Data Studio
// ========

export const datastudio = {
  user: '1564ae35-5e86-4632-bfef-ef7f4db7a865/page/P9czB',
  users: '978dc4a0-6dfc-4499-b159-f69f53aeb3a5/page/00YOC',
  events: 'a98badcf-df61-4f32-903d-6e703c75fd3d/page/TK5PC'
}

// Archipel OrgIds
// ========

export const centralOrgId = {
  cascade8: 'jnbHKBP5YLvRQGcyQ8In',
  catalog: 'nBM8sy5EEAOtVBCX4nTJ',
};

// Import / Export parameters
// =======

export const backupBucket = 'backup-bucket-remco';
export const heavyChunkSize = 5
export const chunkSize = 25

// JwPlayer
// @see https://dashboard.jwplayer.com/#/content/detail?key=7R9ttesP&property=75507f12-83b6-11ea-ab11-3e60acbe08db&spotlight=default&tab=metadata&view=list
// ========

export const playerId = 'LVeBD5vf';
export const testVideoId = 'YlSFNnkR';
