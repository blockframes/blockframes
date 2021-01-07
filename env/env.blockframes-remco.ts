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

export const yandexId = 1234;

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

// Archipel Content OrgId
// ========

export const centralOrgID = 'jnbHKBP5YLvRQGcyQ8In';

// Import / Export parameters
// =======

export const backupBucket = 'backup-bucket-remco';
export const heavyChunkSize = 5
export const chunkSize = 1
