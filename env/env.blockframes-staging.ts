export const production = false;

export const persistenceSettings = {
  synchronizeTabs: true
};

// Firebase
// ========

export const appUrl = {
  content: 'https://staging.archipelcontent.com',
  market: 'https://staging.archipelmarket.com',
  financiers: 'https://staging.mediafinanciers.com',
  crm: 'https://staging.crm.blockframes.io',
};

const firebaseConfig = {
  apiKey: 'AIzaSyAmos48yDq2xnxy9OPtQpLMiE4NeyJlA5Y',
  authDomain: 'blockframes-staging.firebaseapp.com',
  databaseURL: 'https://blockframes-staging.firebaseio.com',
  projectId: 'blockframes-staging',
  storageBucket: 'blockframes-staging.appspot.com',
  messagingSenderId: '176629403574',
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
    appId: "1:1080507348015:web:9abd62a79dc41e710002da",
    measurementId: "G-THGSYK1D7K"
  },
  crm: {
    appId: "1:1080507348015:web:ede10e0ebf25604e0002da",
    measurementId: "G-X8XFZQCL8Z"
  }
}

export function firebase(app: keyof typeof appConfigs = 'festival') {
  return {
    ...firebaseConfig,
    ...appConfigs[app]
  }
}

// Algolia
// =======

export const algolia = {
  appId: '8E9YO1I9HB',
  searchKey: '4a2990a293c0ee0bfde9ebd66270a47f',
  indexNameOrganizations: {
    festival: 'staging_festival_org',
    financiers: 'staging_financiers_org',
    catalog: 'staging_catalog_org'
  },
  indexNameMovies: {
    festival: 'staging_festival_movies',
    financiers: 'staging_financiers_movies',
    catalog: 'staging_catalog_movies',
  },
  indexNameUsers: 'staging_users',
};

// Support emails 
// =======

export const supportEmails = {
  default: 'dev+staging@blockframes.io', // redirect to => blockframes.dev@gmail.com
  catalog: 'dev+staging_catalog@blockframes.io',
  festival: 'dev+staging_festival@blockframes.io',
  financiers: 'dev+staging_financiers@blockframes.io'
}

// Yandex 
// =======

export const yandexId = 0;

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

export const sentryEnv = 'staging';
export const sentryDsn = 'https://a5f8a3139c754fa088453dbd710d9418@sentry.io/1540126';

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

export const bigQueryAnalyticsTable = 'blockframes-staging.analytics_194475853.events_';

// Archipel Content OrgId
// ========

export const centralOrgID = "jnbHKBP5YLvRQGcyQ8In";

// Import / Export parameters
// =======

export const backupBucket = 'staging-backups-bv8ys';
export const heavyChunkSize = 15;
export const chunkSize = 30;
