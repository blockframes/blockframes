export const production = false;

export const persistenceSettings = {
  synchronizeTabs: true
};

// Firebase
// ========

export const appUrl = {
  content: 'https://blockframes-george.web.app',
  market: 'https://blockframes-george-festival.web.app',
  financiers: 'https://blockframes-george-financiers.web.app',
  crm: 'https://blockframes-george-crm.web.app',
};

export const firebase = {
  apiKey: 'AIzaSyBKe0IWd_NQql1cHmcnMJP58ZiTvZyikO0',
  authDomain: 'blockframes-george.firebaseapp.com',
  databaseURL: 'https://blockframes-george.firebaseio.com',
  projectId: 'blockframes-george',
  storageBucket: 'blockframes-george.appspot.com',
  messagingSenderId: '782756549621',
  appId: '1:782756549621:web:e3ae8b3914fd8acc3546bc',
  measurementId: 'G-1ERX03HP3B',
};

// Algolia
// =======

export const algolia = {
  appId: '8E9YO1I9HB',
  searchKey: '4a2990a293c0ee0bfde9ebd66270a47f',
  indexNameOrganizations: {
    festival: 'george_festival_org',
    financiers: 'george_financiers_org',
    catalog: 'george_catalog_org'
  },
  indexNameMovies: {
    festival: 'george_festival_movies',
    financiers: 'george_financiers_movies',
    catalog: 'george_catalog_movies',
  },
  indexNameUsers: 'george_users',
};

// Support emails 
// =======

export const supportEmails = {
  default: 'ggrigorian@cascade8.com',
  catalog: 'ggrigorian+catalog@cascade8.com',
  festival: 'ggrigorian+festival@cascade8.com',
  financiers: 'ggrigorian+financiers@cascade8.com'
}

// Yandex 
// =======

export const yandexId = 0;

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

// BigQuery
// ========

export const bigQueryAnalyticsTable = 'blockframes-george.analytics_235781207.events_';

// Archipel Content OrgId
// ========

export const centralOrgID = "jnbHKBP5YLvRQGcyQ8In";
// Import / Export parameters
// =======

export const backupBucket = 'blockframes-george-backup';
export const heavyChunkSize = 10;
export const chunkSize = 25;
