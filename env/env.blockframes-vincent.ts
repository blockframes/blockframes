export const production = false;

export const persistenceSettings = {
  synchronizeTabs: true
};

// Firebase
// ========

export const appUrl = {
  content: 'https://catalog-blockframes-vincent.web.app',
  market: 'https://festival-blockframes-vincent.web.app',
  crm: 'https://crm-blockframes-vincent.web.app',
  financiers: 'https://financiers-blockframes-vincent.web.app',
};

const firebaseConfig = {
  apiKey: "AIzaSyCA7YvLVF4GUScjaWk4hah3LvByAdL_Z5k",
  authDomain: "blockframes-vincent.firebaseapp.com",
  databaseURL: "https://blockframes-vincent.firebaseio.com",
  projectId: "blockframes-vincent",
  storageBucket: "blockframes-vincent.appspot.com",
  messagingSenderId: "87423685971",
  appId: "1:87423685971:web:154b9dbb018971ea",
  measurementId: "G-XL5ENVWL8Z"
};

export function firebase(app = 'festival') {
  return firebaseConfig
}


// Algolia
// =======

export const algolia = {
  appId: '8E9YO1I9HB',
  searchKey: '4a2990a293c0ee0bfde9ebd66270a47f',
  indexNameOrganizations: {
    festival: 'vincent_festival_org',
    financiers: 'vincent_financiers_org',
    catalog: 'vincent_catalog_org',
  },
  indexNameMovies: {
    festival: 'vincent_festival_movies',
    financiers: 'vincent_financiers_movies',
    catalog: 'vincent_catalog_movies',
  },
  indexNameUsers: 'vincent_users',
};

// Support emails 
// =======

export const supportEmails = {
  default: 'vchoukroun@cascade8.com',
  catalog: 'vchoukroun+catalog@cascade8.com',
  festival: 'vchoukroun+festival@cascade8.com',
  financiers: 'vchoukroun+financiers@cascade8.com'
}

// Yandex 
// =======

export const yandexId = 56105038;

// Intercom
// ========

export const intercomId = 'srwfltp4';

// Ethereum
// ========

export const network = 'ropsten';
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

export const sentryEnv = '';
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
}

// BigQuery
// ========

export const bigQueryAnalyticsTable = 'blockframes-vincent.analytics_194475739.events_';

// Archipel Content OrgId
// ========

export const centralOrgID = "jnbHKBP5YLvRQGcyQ8In";

// Import / Export parameters
// =======

export const backupBucket = 'vincent-backups';
export const heavyChunkSize = 10;
export const chunkSize = 25;
