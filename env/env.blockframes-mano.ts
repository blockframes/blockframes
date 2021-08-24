export const production = false;

export const persistenceSettings = {
  synchronizeTabs: true,
};

// Firebase
// ========

export const appUrl = {
  content: 'https://blockframes-mano.web.app',
  market: 'http://blockframes-mano-festival.web.app',
  financiers: 'http://blockframes-mano-financiers.web.app',
  crm: 'https://blockframes-mano-crm.web.app',
};

const firebaseConfig = {
  apiKey: 'AIzaSyDAD0rQPfLCQcp-sX5MIwHJsRISnMKnDgU',
  authDomain: 'blockframes-mano.firebaseapp.com',
  databaseURL: 'https://blockframes-mano.firebaseio.com',
  projectId: 'blockframes-mano',
  storageBucket: 'blockframes-mano.appspot.com',
  messagingSenderId: '260537474845',
  appId: '1:260537474845:web:5328ccbb9a6fd91baf4bf4',
  measurementId: 'G-GDGR4R6KDY',
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
    festival: 'mano_festival_org',
    financiers: 'mano_financiers_org',
    catalog: 'mano_catalog_org',
  },
  indexNameMovies: {
    festival: 'mano_festival_movies',
    financiers: 'mano_financiers_movies',
    catalog: 'mano_catalog_movies',
  },
  indexNameUsers: 'mano_users',
};

// Support emails
// =======

export const supportEmails = {
  default: 'mbangera@cascade8.com',
  catalog: 'mbangera+catalog@cascade8.com',
  festival: 'mbangera+festival@cascade8.com',
  financiers: 'mbangera+financiers@cascade8.com',
};

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

// Ethereum
// ========

export const network = 'goerli';
export const baseEnsDomain = 'blockframes.test';
export const factoryContract = 'factory2.eth';

// TODO(issue#847): change the address
export const contracts = {
  ipHash: '0x6f77765b18deac65dc55c3a38a112c9583e25185',
  testErc1077: '0x758011e12E57a81f93D1e59AdF8867463349A54d',
  ensResolver: '0xc1EA41786094D1fBE5aded033B5370d51F7a3F96',
};

export const relayer = {
  registryAddress: '0x112234455c3a32fd11230c42e7bccd4a84e02010',
  resolverAddress: '0xc1EA41786094D1fBE5aded033B5370d51F7a3F96',
  network,
  baseEnsDomain,
  factoryContract,
};

// OMDB
// =======

export const omdbApiKey = '4d1be897';

// Sentry
// =======

export const sentryEnv = undefined;
export const sentryDsn = '';

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
};

// BigQuery
// ========

export const bigQueryAnalyticsTable = 'blockframes-staging.analytics_194475853.events_';

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

export const backupBucket = 'mano-backups';
export const heavyChunkSize = 2;
export const chunkSize = 15;

// JwPlayer
// @see https://dashboard.jwplayer.com/#/content/detail?key=7R9ttesP&property=75507f12-83b6-11ea-ab11-3e60acbe08db&spotlight=default&tab=metadata&view=list
// ========

export const playerId = 'LVeBD5vf';
export const testVideoId = 'YlSFNnkR';
