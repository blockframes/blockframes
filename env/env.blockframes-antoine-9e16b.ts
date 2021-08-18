export const production = false;

export const persistenceSettings = {
  synchronizeTabs: true
};

// Firebase
// ========

export const appUrl = {
  content: 'https://catalog-blockframes-antoine.web.app',
  market: 'https://festival-blockframes-antoine.web.app',
  crm: 'https://crm-blockframes-antoine.web.app',
  financiers: 'https://financiers-blockframes-antoine.web.app',
};

const firebaseConfig = {
  apiKey: 'AIzaSyAbWVBOK3olNWQ0IpRTyV_7VaEPJ5w1aKk',
  authDomain: 'blockframes-antoine-9e16b.firebaseapp.com',
  databaseURL: 'https://blockframes-antoine.firebaseio.com',
  projectId: 'blockframes-antoine-9e16b',
  storageBucket: 'blockframes-antoine-9e16b.appspot.com',
  messagingSenderId: '892119097462',
};

const appConfigs = {
  festival: {
    appId: "1:176629403574:web:6b87a6bd036a31923afb17",
    measurementId: "G-YPFLZVR4XP"
  },
  catalog: {
    appId: "1:176629403574:web:d4d965add159857c3afb17",
    measurementId: "G-91803TC0PB"
  },
  financiers: {
    appId: "1:176629403574:web:d581aebb64c37aeb3afb17",
    measurementId: "G-K6EPHB6MQ5"
  },
  cms: {
    appId: "1:176629403574:web:5fdf3cbcb8eb67803afb17",
    measurementId: "G-QCXWY2XS8V"
  },
  crm: {
    appId: "1:176629403574:web:eacdbef9a019b1c33afb17",
    measurementId: "G-WFBNNFQZZM"
  },
  default: {
    appId: "1:176629403574:web:e97f704329b41f233afb17",
    measurementId: "G-46P00JHXXK"
  }
}

export const firebaseRegion = 'europe-west1';

// Enable or disable emulators parts
// and run "npm run firebase:emulator"
// @see https://www.notion.so/cascade8/Emulator-79492738d2614b35b6435eb80584ff26
export const emulators = {
  auth: false,
  firestore: false,
  functions: false
};

export function firebase(app?: keyof typeof appConfigs) {
  return app ? {
    ...firebaseConfig,
    ...appConfigs[app]
  } : {
      ...firebaseConfig,
      ...appConfigs.default
    }
}

// Algolia
// =======

export const algolia = {
  appId: '8E9YO1I9HB',
  searchKey: '4a2990a293c0ee0bfde9ebd66270a47f',
  indexNameOrganizations: {
    festival: 'antoine_festival_org',
    financiers: 'antoine_financiers_org',
    catalog: 'antoine_catalog_org'
  },
  indexNameMovies: {
    festival: 'antoine_festival_movies',
    financiers: 'antoine_financiers_movies',
    catalog: 'antoine_catalog_movies',
  },
  indexNameUsers: 'antoine_users',
};

// Support emails
// =======

export const supportEmails = {
  default: 'apoppe@cascade8.com', // redirect to => blockframes.dev@gmail.com
  catalog: 'apoppe+catalog@cascade8.com',
  festival: 'apoppe+festival@cascade8.com',
  financiers: 'apoppe+financiers@cascade8.com'
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

// Ethereum
// ========

export const network = 'goerli';
export const baseEnsDomain = 'blockframes.test';
export const factoryContract = 'factory2.eth';

// TODO(issue#847): change the address
export const contracts = {
  ipHash: '0x6f77765b18deac65dc55c3a38a112c9583e25185',
  testErc1077: '0x758011e12E57a81f93D1e59AdF8867463349A54d',
  ensResolver: '0xc1EA41786094D1fBE5aded033B5370d51F7a3F96'
};

export const relayer = {
  registryAddress: '0x112234455c3a32fd11230c42e7bccd4a84e02010',
  resolverAddress: '0xc1EA41786094D1fBE5aded033B5370d51F7a3F96',
  network,
  baseEnsDomain,
  factoryContract
};

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

// BigQuery  / Data Studio
// ========

export const bigQueryAnalyticsTable = 'blockframes-staging.analytics_194475853.events_';

// Data Studio
// ========

export const datastudio = {
  user: '',
  users: '',
  events: ''
}


// Archipel OrgIds
// ========

export const centralOrgId = {
  cascade8: 'jnbHKBP5YLvRQGcyQ8In',
  catalog: 'nBM8sy5EEAOtVBCX4nTJ',
};

// Import / Export parameters
// =======

export const backupBucket = 'blockframes-antoine-backup';
export const heavyChunkSize = 15;
export const chunkSize = 30;

// JwPlayer
// @see https://dashboard.jwplayer.com/#/content/detail?key=7R9ttesP&property=75507f12-83b6-11ea-ab11-3e60acbe08db&spotlight=default&tab=metadata&view=list
// ========

export const playerId = 'LVeBD5vf';
export const testVideoId = 'YlSFNnkR';
