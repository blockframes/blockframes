export const production = true;

export const persistenceSettings = {
  synchronizeTabs: true
};

// Firebase
// ========

export const appUrl = {
  content: 'https://demo5.archipelcontent.com',
  market: 'https://demo5.archipelmarket.com',
  crm: 'https://demo5.crm.blockframes.io',
  financiers: 'https://blockframes-demo5-financiers.web.app',
}

export const firebase = {
  apiKey: 'AIzaSyBF8-76Sf4oOJfL-fwASGx8R51w9UkG0rw',
  authDomain: 'blockframes-demo-5.firebaseapp.com',
  databaseURL: 'https://blockframes-demo-5.firebaseio.com',
  projectId: 'blockframes-demo-5',
  storageBucket: 'blockframes-demo-5.appspot.com',
  messagingSenderId: '671401949747',
  appId: '1:671401949747:web:e2eb0e66e6e6afee264146',
  // @TODO measurementId: ""
};

// Algolia
// =======

export const algolia = {
  appId: '8E9YO1I9HB',
  searchKey: '4a2990a293c0ee0bfde9ebd66270a47f',
  indexNameOrganizations: {
    festival: 'demo5_festival_org',
    financiers: 'demo5_financiers_org',
    catalog: 'demo5_catalog_org'
  },
  indexNameMovies: {
    festival: 'demo5_festival_movies',
    financiers: 'demo5_financiers_movies',
    catalog: 'demo5_catalog_movies',
  },
  indexNameUsers: 'demo5_users',
};

// Support emails
// =======

export const supportEmails = {
  default: 'dev+demo5@blockframes.io', // redirect to => blockframes.dev@gmail.com
  catalog: 'dev+demo5_catalog@blockframes.io',
  festival: 'dev+demo5_festival@blockframes.io',
  financiers: 'dev+demo5_financiers@blockframes.io'
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

export const sentryEnv = 'demo-5';
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
export const bigQueryAnalyticsTable = 'blockframes-demo-5.analytics_197180636.events_';

// Archipel Content OrgId
// ========

export const centralOrgID = "jnbHKBP5YLvRQGcyQ8In";

// Import / Export parameters
// =======

export const backupBucket = 'demo5-backups';
export const heavyChunkSize = 15;
export const chunkSize = 30;
